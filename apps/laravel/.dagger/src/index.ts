import {
	type Directory,
	object,
	func,
	argument,
	Container,
	dag,
	File,
	Platform
} from "@dagger.io/dagger";
import * as crypto from "crypto"

@object()
export class Laravel {
  laravelDir: Directory;
	supervisor: File;

	/**
	 * Create a new DaggerPlayground instance.
	 *
	 * @param laravelDir - The directory to use for the Laravel app.
	 *              Defaults to "/apps/laravel" and ignores certain files and directories.
	 */
	constructor(
		@argument({ 
			defaultPath: "/apps/laravel",
			ignore: [
				'vendor',
				'.env',
				'docker-compose.yml',
			]
		}) laravelDir: Directory,
		@argument({
			defaultPath: "/.docker/supervisor/supervisord.conf",
		}) supervisor: File 
	) {
		this.laravelDir = laravelDir;
		this.supervisor = supervisor;
	}

  private async appEnv(
		{ target, platform }: { 
			target: 'cicd-stage' | 'prod-stage', 
			platform?: Platform 
		} = { target: "cicd-stage" }): Promise<Container> {
		const lockfile = await this.laravelDir.file("composer.lock").contents()
    const lockHash = crypto.createHash("sha256").update(lockfile).digest("hex").slice(0, 12)

		return this.laravelDir
			.with((dir) => {
				if (target === "prod-stage") {
					return dir.withFile("supervisord.conf", this.supervisor)
				}
				return dir
			})
			.dockerBuild({ target, platform })
				.with((ctx) => {
					if (target === "prod-stage") {
						return ctx.withMountedFile("/etc/supervisor/conf.d/supervisord.conf", this.supervisor)
					}
					return ctx
						.withMountedDirectory("/var/www", this.laravelDir)
						.withMountedCache("/var/www/vendor", dag.cacheVolume(`vendor-${target}-${lockHash}`))
						.withExec(['composer', 'install', '--no-interaction', '--prefer-dist']);
				})
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
	 * @returns The container for the Laravel app in the prod stage.
	 */
	@func()
	async prod(): Promise<Container> {
		return this.appEnv({ target: "prod-stage" })
	}
}
