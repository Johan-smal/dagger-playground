import {
	type Directory,
	object,
	func,
	argument,
	Container,
	dag,
} from "@dagger.io/dagger";
/** @ts-ignore */
import * as crypto from "crypto"

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

	private async env(): Promise<Container> {
		const lockfile = await this.dir.file("composer.lock").contents()
    const lockHash = crypto.createHash("sha256").update(lockfile).digest("hex").slice(0, 12)

		return this.dir.dockerBuild()
			.withMountedDirectory("/var/www", this.dir)
			.withMountedCache("/var/www/vendor", dag.cacheVolume(`vendor-${lockHash}`))
			.withExec(['composer', 'install', '--no-interaction', '--prefer-dist'])
	}

	/**
	 * Run function to inspect the container.
	 */
	@func()
	async inspect(): Promise<Container> {
		return (await this.env())
			.withWorkdir("/var/www")
			.terminal()
	}
	/**
	 * Run app tests
	 */
	@func()
	async test(): Promise<string> {
		return (await this.env())
			.withExec(['php', 'artisan', 'test'])
			.stdout();
	}

	/**
	 * Run app linter
	 */
	@func()
	async lint(): Promise<string> {
		return (await this.env())
			.withExec(['./vendor/bin/pint', '--test'])
			.stdout()
	}
}
