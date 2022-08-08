import { Constants, Message } from 'discord.js'
import { ApplyOptions } from '@sapphire/decorators'
import { Colors } from '@bitomic/material-colors'
import type { Interaction } from 'discord.js'
import { Listener } from '@sapphire/framework'
import type { ListenerOptions } from '@sapphire/framework'

@ApplyOptions<ListenerOptions>( {
	event: Constants.Events.INTERACTION_CREATE
} )
export class UserEvent extends Listener {
	public async run( interaction: Interaction ): Promise<void> {
		if ( !interaction.isButton() || !interaction.inGuild() || !interaction.customId.startsWith( 'claim-' ) ) return

		await interaction.deferReply()
		let { message } = interaction
		if ( !( message instanceof Message<boolean> ) ) {
			const guild = interaction.guild ?? await this.container.client.guilds.fetch( interaction.guildId )
			const channel = interaction.channel ?? await guild.channels.fetch( interaction.channelId )
			if ( !channel?.isText() ) return
			message = await channel.messages.fetch( message.id )
		}
		await message.delete().catch( () => null )

		const [ , itemIdString ] = interaction.customId.split( '-' )
		const itemId = parseInt( itemIdString ?? '', 10 )
		if ( !itemId ) {
			await interaction.editReply( {
				embeds: [ {
					color: Colors.red.s800,
					description: 'Estoy teniendo problemas para reconocer este objeto...'
				} ]
			} )
			return
		}

		const models = this.container.stores.get( 'models' )
		const inventories = models.get( 'Inventories' )

		try {
			await inventories.addItem( {
				guild: interaction.guildId,
				snowflake: interaction.user.id
			}, itemId )

			const item = await models.get( 'Items' ).getItemById( itemId )
			void interaction.editReply( {
				embeds: [ {
					color: Colors.green.s800,
					description: `¡<@!${ interaction.user.id }> ha conseguido **${ item?.name ?? 'un objeto' }**!`
				} ]
			} )
		} catch ( e ) {
			this.container.logger.error( e )
			void interaction.editReply( {
				embeds: [ {
					color: Colors.red.s800,
					description: 'Ocurrió un error al intentar guardar el objeto.'
				} ]
			} )
		}
	}
}
