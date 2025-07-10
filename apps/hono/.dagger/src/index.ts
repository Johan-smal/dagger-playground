import {
	type Directory,
	object,
	func,
	argument,
	Container,
	dag,
	Platform
} from "@dagger.io/dagger";
import * as crypto from "crypto"

@object()
export class Hono {
  honoDir: Directory;
	/**
	 * Create a new DaggerPlayground instance.
	 *
	 * @param honoDir - The directory to use for the Hono app.
	 *              Defaults to "/apps/hono" and ignores certain files and directories.
	 */
	constructor(
		@argument({ 
			defaultPath: "/apps/hono",
			ignore: [
        'coverage',
				'node_modules',
				'.env',
				'docker-compose.yml',
			]
		}) honoDir: Directory
	) {
		this.honoDir = honoDir;
	}

  private async appEnv(
		{ target, platform }: { 
			target: 'cicd-stage' | 'prod-stage', 
			platform?: Platform 
		} = { target: "cicd-stage" }): Promise<Container> {
		const lockfile = await this.honoDir.file("bun.lock").contents()
    const lockHash = crypto.createHash("sha256").update(lockfile).digest("hex").slice(0, 12)

		return this.honoDir
			.dockerBuild({ target, platform })
				.with((ctx) => {
					if (target === "prod-stage") {
						return ctx;
					}
					return ctx
						.withMountedDirectory("/app", this.honoDir)
						.withMountedCache("/app/node_modules", dag.cacheVolume(`vendor-${target}-${lockHash}`))
						.withExec(['bun', 'install', '--frozen-lockfile']);
				})
	}
  /**
	 * Run function to inspect the container.
	 */
	@func()
	async inspect(): Promise<Container> {
		return (await this.appEnv()).terminal()
	}
	/**
	 * Run app tests
	 */
	@func()
	async test(ctr?: Container): Promise<string> {
		return (ctr ?? await this.appEnv())
			.withExec(['bun', 'test'])
			.stdout();
	}

  /**
   * Return the coverage report
   */
  @func()
  async coverage(ctr?: Container): Promise<Directory> {
    return (ctr ?? await this.appEnv())
      .withExec(['bun', 'test:coverage'])
      .directory('/app/coverage');
  }

	/**
	 * Run app linter
	 */
	@func()
	async lint(ctr?: Container): Promise<string> {
		// return (ctr ?? await this.appEnv())
		// 	.withExec(['./vendor/bin/pint', '--test'])
		// 	.stdout()
    return Promise.resolve("Linting is not implemented yet.");
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
	 * @returns The container for the hono app in the prod stage.
	 */
	@func()
	async prod(): Promise<Container> {
		return this.appEnv({ target: "prod-stage" })
	}
}

