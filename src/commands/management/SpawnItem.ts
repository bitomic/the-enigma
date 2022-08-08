import type { ApplicationCommandRegistry, CommandOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import { Command } from '@sapphire/framework'
import type { CommandInteraction } from 'discord.js'
import { PermissionFlagsBits } from 'discord-api-types/v9'

@ApplyOptions<CommandOptions>( {
	description: 'Haz aparecer un objeto.',
	enabled: true,
	name: 'spawn-item',
	preconditions: [ 'OwnerOnly' ]
} )
export class UserCommand extends Command {
	public override async registerApplicationCommands( registry: ApplicationCommandRegistry ): Promise<void> {
		registry.registerChatInputCommand(
			builder => builder
				.setName( this.name )
				.setDescription( this.description )
				.setDMPermission( false )
				.setDefaultMemberPermissions( PermissionFlagsBits.ManageGuild ),
			await this.container.stores.get( 'models' ).get( 'Commands' )
				.getData( this.name )
		)
	}

	public override async chatInputRun( interaction: CommandInteraction<'cached' | 'raw'> ): Promise<void> {
		await interaction.reply( {
			content: 'Comando recibido.',
			ephemeral: true
		} )
		this.container.stores.get( 'scheduled-tasks' ).get( 'spawn-item' )
			?.run( undefined )
	}
}
