import {
	type Directory,
	object,
	func,
	argument,
	Container,
	dag,
	File,
	Secret
} from "@dagger.io/dagger";

export enum Apps {
  Laravel = "laravel",
  Bun = "bun"
}

@object()
export class DaggerPlayground {
	infraDir: Directory;
	credentials: File;
	config: File;

	/**
	 * Create a new DaggerPlayground instance.
	 *
	 */
	constructor(
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
		this.infraDir = infraDir;
		this.credentials = credentials;
		this.config = config;
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
	async inspect(m: Apps = Apps.Laravel): Promise<Container> {
		switch (m) {
			case Apps.Laravel:
				return dag[m]().inspect();
			default:
				throw new Error(`Unknown app: ${m}`);
		}
	}
	/**
	 * Run app tests
	 */
	@func()
	async test(m: Apps = Apps.Laravel): Promise<string> {
		switch (m) {
			case Apps.Laravel:
				return dag[m]().test();
			default:
				throw new Error(`Unknown app: ${m}`);
		}
	}

	/**
	 * Run app linter
	 */
	@func()
	async lint(m: Apps = Apps.Laravel): Promise<string> {
		switch (m) {
			case Apps.Laravel:
				return dag[m]().lint();
			default:
				throw new Error(`Unknown app: ${m}`);
		}
	}

	/**
	 * Pre-build steps
	 */
	@func()
	async prebuild(m: Apps = Apps.Laravel): Promise<string[]> {
		switch (m) {
			case Apps.Laravel:
				return dag[m]().prebuild();
			default:
				throw new Error(`Unknown app: ${m}`);
		}
	}	

	@func()
	async push(tag: string = "latest"): Promise<string> {
		const awsCli = await this.awsCliEnv();
		const [ctx, ecrLoginPassword, awsAccountId] = await Promise.all([
			dag.laravel().prod(),
			this.ecrLoginPassword(awsCli),
			this.awsAccountId(awsCli)
		]);
		
		return ctx.withRegistryAuth(`${awsAccountId}.dkr.ecr.eu-central-1.amazonaws.com`, "AWS", ecrLoginPassword)
			.publish(`${awsAccountId}.dkr.ecr.eu-central-1.amazonaws.com/laravel:${tag}`)
	}

	@func()
	async deploy(tag: string = "latest"): Promise<string> {
		const awsCli = await this.awsCliEnv();
		const [awsAccountId] = await Promise.all([
			this.awsAccountId(awsCli),
		]);

		const clusterName = "app-cluster";  
		const serviceName = "laravel-service";     
		const family = "laravel-task";             

		// 1. Get the current task definition JSON
		const describeTaskDef = await awsCli.withExec([
			'aws', 'ecs', 'describe-task-definition',
			'--task-definition', family,
			'--query', 'taskDefinition',
		]).stdout();

		// Parse JSON to modify container image
  	const taskDef = JSON.parse(describeTaskDef);

		// Update container image in the containerDefinitions array
		for (const container of taskDef.containerDefinitions) {
			if (["php", "supervisor"].includes(container.name)) {  // replace with your container name
				container.image = `${awsAccountId}.dkr.ecr.eu-central-1.amazonaws.com/laravel:${tag}`;
			}
		}

		// Remove unnecessary fields before registering new task def (like status, revision)
		delete taskDef.status;
		delete taskDef.revision;
		delete taskDef.taskDefinitionArn;
		delete taskDef.requiresAttributes;
		delete taskDef.compatibilities;
		delete taskDef.registeredAt;
		delete taskDef.registeredBy;

		const awsCliDeploy = await this.awsCliEnv();
		const containerWithFile = awsCliDeploy.withNewFile('/tmp/new-task-def.json', JSON.stringify(taskDef))

		// Register new task definition and capture ARN
		const newTaskDefArn = await containerWithFile.withExec([
			'aws', 'ecs', 'register-task-definition',
			'--cli-input-json', 'file:///tmp/new-task-def.json',
			'--query', 'taskDefinition.taskDefinitionArn',
			'--output', 'text'
		]).stdout();

		// 3. Update ECS service to use new task definition
		const updateServiceOutput = await awsCliDeploy.withExec([
			'aws', 'ecs', 'update-service',
			'--cluster', clusterName,
			'--service', serviceName,
			'--task-definition', newTaskDefArn.trim()
		]).stdout();

		// 4. Update Parameter Store with new container tag
		const ssmParaterUpdate = await awsCli.withExec([
			'aws', 'ssm', 'put-parameter',
			'--name', '/laravel/container/tag',
			'--value', tag,
			'--type', 'String',
			'--overwrite'
		]).stdout();

		return [updateServiceOutput, ssmParaterUpdate].join("\n");
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
	async plan(target?: string): Promise<string> {
		return (await this.infraEnv())
			.withExec([...['terraform', 'plan'], ...(target ? [`-target=module.${target}`] : [])])
			.stdout();
	}
}
