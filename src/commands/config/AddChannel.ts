import type { ApplicationCommandRegistry, CommandOptions } from '@sapphire/framework'
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v9'
import { ApplyOptions } from '@sapphire/decorators'
import Colors from '@bitomic/material-colors'
import { Command } from '@sapphire/framework'
import type { CommandInteraction } from 'discord.js'

@ApplyOptions<CommandOptions>( {
	description: 'Agrega un canal.',
	enabled: true,
	name: 'agregar-canal',
} )
export class UserCommand extends Command {
	public override async registerApplicationCommands( registry: ApplicationCommandRegistry ): Promise<void> {
		registry.registerChatInputCommand(
			builder => builder
				.setName( this.name )
				.setDescription( this.description )
				.setDMPermission( false )
				.setDefaultMemberPermissions( PermissionFlagsBits.ManageGuild )
				.addChannelOption( option => option
					.setName( 'canal' )
					.setDescription( 'Mención del canal' )
					.setRequired( true )
					.addChannelTypes( ChannelType.GuildText ) ),
			await this.container.stores.get( 'models' ).get( 'Commands' )
				.getData( this.name )
		)
	}

	public override chatInputRun( interaction: CommandInteraction<'cached' | 'raw'> ): void {
		const channel = interaction.options.getChannel( 'canal', true )
		void this.container.stores.get( 'models' ).get( 'Channels' )
			.addChannel( interaction.guildId, channel.id )
		void interaction.reply( {
			embeds: [ {
				color: Colors.green.s800,
				description: `He registrado <#${ channel.id }> exitosamente.`
			} ]
		} )
	}
}
