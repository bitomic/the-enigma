import { ApplyOptions } from '@sapphire/decorators'
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks'

@ApplyOptions<ScheduledTask.Options>( {
	enabled: false,
	interval: 1000 * 10,
	name: 'ping'
} )
export class UserTask extends ScheduledTask {
	public run(): void {
		this.container.logger.info( 'Ping!' )
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		ping: never;
	}
}
