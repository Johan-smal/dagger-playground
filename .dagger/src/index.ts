import {
	type Directory,
	object,
	func,
	argument,
	Container,
	dag,
	File,
	Secret,
	Platform
} from "@dagger.io/dagger";
import * as crypto from "crypto"

@object()
export class DaggerPlayground {
	appDir: Directory;
	infraDir: Directory;
	credentials: File;
	config: File;

	/**
	 * Create a new DaggerPlayground instance.
	 *
	 * @param appDir - The directory to use for the DaggerPlayground instance.
	 *              Defaults to "/app" and ignores certain files and directories.
	 */
	constructor(
		@argument({ 
			defaultPath: "/app",
			ignore: [
				'vendor',
				'.env',
				'docker-compose.yml',
			]
		}) appDir: Directory,
		@argument({ 
			defaultPath: "/infra",
			ignore: [
				'.terraform',
			]
		}) infraDir: Directory,
		@argument({
			defaultPath: "/credentials"
		}) credentials: File,
		@argument({
			defaultPath: "/config"
		}) config: File
	) {
		this.appDir = appDir;
		this.infraDir = infraDir;
		this.credentials = credentials;
		this.config = config;
	}

	private async appEnv(
		{ target, platform }: { 
			target: 'base' | 'prod-stage', 
			platform?: Platform 
		} = { target: "base" }): Promise<Container> {
		const lockfile = await this.appDir.file("composer.lock").contents()
    const lockHash = crypto.createHash("sha256").update(lockfile).digest("hex").slice(0, 12)
		const installCommand = target === "base" ? 
				['composer', 'install', '--no-interaction', '--prefer-dist'] : ['ls', '-la'];
		return this.appDir.dockerBuild({ target, platform })
			.withMountedDirectory("/var/www", this.appDir)
			.withMountedCache("/var/www/vendor", dag.cacheVolume(`vendor-${target}-${lockHash}`))
			.withExec(installCommand)
	}

	private async infraEnv(): Promise<Container> {
		return dag.container()
				.from("hashicorp/terraform:1.12.1")
				.withMountedDirectory("/infra", this.infraDir)
				.withMountedSecret("/root/.aws/credentials", dag.setSecret("AWS_CREDENTIALS", await this.credentials.contents()))
				.withWorkdir("/infra")
				.withMountedCache("/infra/.terraform", dag.cacheVolume("terraform"))
				.withExec([
					'terraform', 'init',
					`--backend-config=backend.tfvars`,
				])
	}

	private async awsCliEnv(): Promise<Container> {
		return dag.container()
			.from("public.ecr.aws/aws-cli/aws-cli:latest")
			.withFile("/root/.aws/config", this.config)
			.withMountedSecret("/root/.aws/credentials", dag.setSecret("AWS_CREDENTIALS", await this.credentials.contents()))
	}

	private async awsAccountId(ctx?: Container): Promise<string> {
		const awsCli = ctx ?? await this.awsCliEnv();
		return (await awsCli.withExec(['aws', 'sts', 'get-caller-identity']).stdout()).match(/"Account": "(\d+)"/)?.[1] ?? "";
	}

	private async ecrLoginPassword(ctx?: Container): Promise<Secret> {
		const awsCli = ctx ?? await this.awsCliEnv();
		return dag.setSecret("ECR_LOGIN_PASSWORD", await awsCli.withExec(['aws', 'ecr', 'get-login-password']).stdout());
	}

	private async loadEnvironmentVariables(dir: Directory, target = ".env"): Promise<void> {
		const envFile = await dir.file(target).contents();
		// Ensure the .env file is loaded into the environment
		for (const line of envFile.split("\n")) {
			const [key, value] = line.split("=");
			if (key && value) {
				Bun.env[key] = value;
			}
		}
	}

	/**
	 * Run function to inspect the container.
	 */
	@func()
	async inspect(): Promise<Container> {
		return (await this.appEnv())
			.withWorkdir("/var/www")
			.terminal()
	}
	/**
	 * Run app tests
	 */
	@func()
	async test(ctr?: Container): Promise<string> {
		return (ctr ?? await this.appEnv())
			.withExec(['php', 'artisan', 'test'])
			.stdout();
	}

	/**
	 * Run app linter
	 */
	@func()
	async lint(ctr?: Container): Promise<string> {
		return (ctr ?? await this.appEnv())
			.withExec(['./vendor/bin/pint', '--test'])
			.stdout()
	}

	@func()
	async push() {
		const awsCli = await this.awsCliEnv();
		const [ctx, ecrLoginPassword, awsAccountId] = await Promise.all([
			this.appEnv({ target: "prod-stage", platform: "linux/amd64" as Platform }),
			this.ecrLoginPassword(awsCli),
			this.awsAccountId(awsCli)
		]);
		
		ctx.withRegistryAuth(`${awsAccountId}.dkr.ecr.eu-central-1.amazonaws.com`, "AWS", ecrLoginPassword)
			.publish(`${awsAccountId}.dkr.ecr.eu-central-1.amazonaws.com/app:latest`)
	}

	/**
	 * Pre-build steps
	 */
	@func()
	async prebuild(): Promise<string[]> {
		const appEnv = await this.appEnv();
		return await Promise.all([
			this.test(appEnv),
			this.lint(appEnv),
		])
	}
	/**
	 * Terraform container
	 */
	@func()
	async infra(): Promise<Container> {
		return (await this.infraEnv())
			.terminal();
	}

	/**
	 * Run terraform plan
	 */
	@func()
	async plan(): Promise<string> {
		return (await this.infraEnv())
			.withExec(['terraform', 'plan'])
			.stdout();
	}
}
