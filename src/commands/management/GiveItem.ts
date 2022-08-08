import type { ApplicationCommandRegistry, CommandOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import { Colors } from '@bitomic/material-colors'
import { Command } from '@sapphire/framework'
import type { CommandInteraction } from 'discord.js'

@ApplyOptions<CommandOptions>( {
	description: 'Da un objeto a alguien.',
	enabled: true,
	name: 'dar-objeto',
	preconditions: [ 'OwnerOnly' ]
} )
export class UserCommand extends Command {
	public override async registerApplicationCommands( registry: ApplicationCommandRegistry ): Promise<void> {
		registry.registerChatInputCommand(
			builder => builder
				.setName( this.name )
				.setDescription( this.description )
				.setDMPermission( false )
				.addUserOption( option => option
					.setName( 'usuario' )
					.setDescription( 'Usuario que recibirá el objeto.' )
					.setRequired( true ) )
				.addIntegerOption( option => option
					.setName( 'objeto' )
					.setDescription( 'Identificador del objeto' )
					.setRequired( true ) )
				.addBooleanOption( option => option
					.setName( 'remover' )
					.setDescription( 'Remover objeto.' ) ),
			await this.container.stores.get( 'models' ).get( 'Commands' )
				.getData( this.name )
		)
	}

	public override async chatInputRun( interaction: CommandInteraction<'cached' | 'raw'> ): Promise<void> {
		await interaction.deferReply()

		const user = interaction.options.getUser( 'usuario', true )
		const itemId = interaction.options.getInteger( 'objeto', true )
		const remove = interaction.options.getBoolean( 'remover' )

		const models = this.container.stores.get( 'models' )
		const item = await models.get( 'Items' ).getItemById( itemId )
		if ( !item ) {
			void interaction.editReply( {
				embeds: [ {
					color: Colors.red.s800,
					description: 'No he podido encontrar un objeto con ese identificador.'
				} ]
			} )
			return
		}

		const inventories = models.get( 'Inventories' )
		try {
			await inventories[ remove ? 'removeItem' : 'addItem' ]( {
				guild: interaction.guildId,
				snowflake: interaction.user.id
			}, itemId )
			void interaction.editReply( {
				embeds: [ {
					color: remove ? Colors.red.s800 : Colors.green.s800,
					description: `He ${ remove ? 'removido' : 'añadido' } exitosamente **${ item.name }** al inventario de <@!${ user.id }> (${ user.tag }).`
				} ]
			} )
		} catch ( e ) {
			this.container.logger.error( e )
		}
	}
}
