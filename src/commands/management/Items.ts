import type { ApplicationCommandRegistry, CommandOptions } from '@sapphire/framework'
import { ApplyOptions } from '@sapphire/decorators'
import { Command } from '@sapphire/framework'
import type { CommandInteraction } from 'discord.js'
import { Fandom } from 'mw.js'
import type { IItem } from '../../models/Items'
import { parse } from 'mwparser'

@ApplyOptions<CommandOptions>( {
	description: 'Carga la información de los objetos.',
	enabled: true,
	name: 'load-items'
} )
export class UserCommand extends Command {
	public override async registerApplicationCommands( registry: ApplicationCommandRegistry ): Promise<void> {
		registry.registerChatInputCommand(
			builder => builder
				.setName( this.name )
				.setDescription( this.description ),
			await this.container.stores.get( 'models' ).get( 'Commands' )
				.getData( this.name )
		)
	}

	public override async chatInputRun( interaction: CommandInteraction ): Promise<void> {
		await interaction.deferReply()
		const t1 = Date.now()

		const wiki = Fandom.getWiki( 'es.bindingofisaac' )
		const titles = [
			...( await wiki.queryList( {
				cmlimit: 'max',
				cmnamespace: 0,
				cmtitle: 'Categoría:Objetos activables',
				list: 'categorymembers'
			} ) ).map( i => i.title ),
			...( await wiki.queryList( {
				cmlimit: 'max',
				cmnamespace: 0,
				cmtitle: 'Categoría:Objetos pasivos',
				list: 'categorymembers'
			} ) ).map( i => i.title )
		]

		const pages = wiki.iterPages( titles )
		const data: IItem[] = []
		for await ( const page of pages ) {
			if ( page.missing ) continue
			const parsed = parse( page.revisions[ 0 ].slots.main.content )
			const [ infobox ] = parsed.findTemplate( 'Infobox Objeto' ).templates
			if ( !infobox ) continue

			const id = infobox.getParameter( 'identificador' )?.value
			const description = infobox.getParameter( 'descripción' )?.value
			const type = infobox.getParameter( 'tipo' )?.value
			if ( !id || !description || !type || id === '474' ) continue // 474 = Broken Glass Cannon and Tonsil
			data.push( {
				description,
				id: parseInt( id, 10 ),
				name: page.title,
				type: type === 'Activable' ? 'Active' : 'Passive'
			} )
		}

		const items = this.container.stores.get( 'models' ).get( 'Items' )
		await items.model.truncate()
		const success = await items.model.bulkCreate( data )
			.then( () => true )
			.catch( () => false )

		const t2 = Date.now()
		void interaction.editReply( `Task ${ success ? 'finished successfully' : 'failed' } (${ t2 - t1 }ms).` )
	}
}
