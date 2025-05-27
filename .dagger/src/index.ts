import {
	type Directory,
	object,
	func,
	argument,
	Container,
	dag,
} from "@dagger.io/dagger";

@object()
export class DaggerPlayground {
	dir: Directory;

	/**
	 * Create a new DaggerPlayground instance.
	 *
	 * @param dir - The directory to use for the DaggerPlayground instance.
	 *              Defaults to "/app" and ignores certain files and directories.
	 */
	constructor(
		@argument({ 
			defaultPath: "/app",
			ignore: [
				'vendor',
				'docker-compose.yml',
			]
		}) dir: Directory
	) {
		this.dir = dir;
	}

	private env(): Container {
		return this.dir.dockerBuild()
			.withMountedDirectory("/var/www", this.dir)
			.withMountedCache("/var/www/vendor", dag.cacheVolume("vendor"))
			.withExec(['composer', 'install', '--no-interaction', '--prefer-dist'])
	}

	/**
	 * Run function to inspect the container.
	 */
	@func()
	async inspect(): Promise<Container> {
		return this.env()
			.withWorkdir("/var/www")
			.terminal()
	}
	/**
	 * Run app tests
	 */
	@func()
	async test(): Promise<string> {
		return this.env()
			.withExec(['php', 'artisan', 'test'])
			.stdout();
	}

	/**
	 * Run app linter
	 */
	@func()
	async lint(): Promise<string> {
		return this.env()
			.withExec(['./vendor/bin/pint', '--test'])
			.stdout()
	}
}
