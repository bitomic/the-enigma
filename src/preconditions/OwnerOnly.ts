import type { Interaction, Message } from 'discord.js'
import type { PreconditionOptions, PreconditionResult } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import { env } from '../lib'
import { Precondition } from '@sapphire/framework'

@ApplyOptions<PreconditionOptions>( {
	name: 'OwnerOnly'
} )
export class UserPrecondition extends Precondition {
	public override chatInputRun( interaction: Interaction ): PreconditionResult {
		return interaction.user.id === env.DISCORD_OWNER
			? this.ok()
			: this.error()
	}

	public override messageRun( message: Message ): PreconditionResult {
		return message.author.id === env.DISCORD_OWNER
			? this.ok()
			: this.error()
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		OwnerOnly: never
	}
}
