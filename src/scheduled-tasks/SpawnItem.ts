import { ApplyOptions } from '@sapphire/decorators'
import { request } from 'undici'
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks'

@ApplyOptions<ScheduledTask.Options>( {
	cron: '0 30 * * * *',
	enabled: true,
	name: 'spawn-item'
} )
export class UserTask extends ScheduledTask {
	public async run(): Promise<void> {
		const models = this.container.stores.get( 'models' )
		const channelItem = await models.get( 'Channels' ).getRandomChannel()
		if ( !channelItem ) return
		const item = await models.get( 'Items' ).getRandomItem()
		if ( !item ) return

		const guild = await this.container.client.guilds.fetch( channelItem.guild )
			.catch( () => null )
		const channel = await guild?.channels.fetch( channelItem.channel )
			.catch( () => null )
		if ( !channel || channel.type !== 'GUILD_TEXT' ) return

		const image = `https://bindingofisaac.fandom.com/es/wiki/Special:Filepath/Pedestal_${ item.name.replace( / /g, '_' ) }.png`
		const { statusCode } = await request( image, {
			method: 'HEAD'
		} )
		if ( statusCode < 200 || statusCode >= 400 ) return
		await channel.send( {
			components: [ {
				components: [ {
					customId: `claim-${ item.id }`,
					label: 'Recoger',
					style: 'PRIMARY',
					type: 'BUTTON'
				} ],
				type: 'ACTION_ROW'
			} ],
			content: image
		} )
	}
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		'spawn-item': never;
	}
}
