import {
	type Directory,
	object,
	func,
	argument,
	Container,
	dag
} from "@dagger.io/dagger";
import * as crypto from "crypto"

@object()
export class DaggerPlayground {
	appDir: Directory;
	infraDir: Directory;

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
				'docker-compose.yml',
			]
		}) appDir: Directory,
		@argument({ 
			defaultPath: "/infra",
			ignore: [
				'.terraform',
			]
		}) infraDir: Directory,
	) {
		this.appDir = appDir;
		this.infraDir = infraDir;
	}

	private async appEnv(): Promise<Container> {
		const lockfile = await this.appDir.file("composer.lock").contents()
    const lockHash = crypto.createHash("sha256").update(lockfile).digest("hex").slice(0, 12)

		return this.appDir.dockerBuild({ target: "base"})
			.withMountedDirectory("/var/www", this.appDir)
			.withMountedCache("/var/www/vendor", dag.cacheVolume(`vendor-${lockHash}`))
			.withExec(['composer', 'install', '--no-interaction', '--prefer-dist'])
	}

	private async infraEnv(): Promise<Container> {
		await this.loadEnvironmentVariables(this.infraDir);
		return this.withAwsCredentials(dag.container())
				.from("hashicorp/terraform:1.12.1")
				.withMountedDirectory("/infra", this.infraDir)
				.withWorkdir("/infra")
				.withMountedCache("/infra/.terraform", dag.cacheVolume("terraform"))
				.withExec([
					'terraform', 'init',
					`--backend-config=backend.tfvars`,
				])
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

	private withAwsCredentials(container: Container): Container {
		return container
			.withSecretVariable("AWS_ACCESS_KEY_ID", dag.setSecret("AWS_ACCESS_KEY_ID", Bun.env.AWS_ACCESS_KEY_ID || ""))
			.withSecretVariable("AWS_SECRET_ACCESS_KEY", dag.setSecret("AWS_SECRET_ACCESS_KEY", Bun.env.AWS_SECRET_ACCESS_KEY || ""));
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
	async test(): Promise<string> {
		return (await this.appEnv())
			.withExec(['php', 'artisan', 'test'])
			.stdout();
	}

	/**
	 * Run app linter
	 */
	@func()
	async lint(): Promise<string> {
		return (await this.appEnv())
			.withExec(['./vendor/bin/pint', '--test'])
			.stdout()
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
