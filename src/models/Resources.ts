import type { ModelStatic, Model as SequelizeModel } from 'sequelize'
import type { PieceContext, PieceOptions } from '@sapphire/pieces'
import { DataTypes } from 'sequelize'
import { Model } from '../framework'

export interface IResource {
	bombs: number
	coins: number
	keys: number
	playerId: number
}

interface IResourceInterface extends SequelizeModel<IResource, Omit<IResource, 'bombs' | 'coins' | 'keys'>>, IResource {
}

export class ResourceModel extends Model<IResourceInterface> {
	public readonly model: ModelStatic<IResourceInterface>

	public constructor( context: PieceContext, options: PieceOptions ) {
		super( context, {
			...options,
			name: 'Resources'
		} )

		this.model = this.container.sequelize.define<IResourceInterface>(
			'Resources',
			{
				bombs: {
					defaultValue: 0,
					type: DataTypes.INTEGER
				},
				coins: {
					defaultValue: 0,
					type: DataTypes.INTEGER
				},
				keys: {
					defaultValue: 0,
					type: DataTypes.INTEGER
				},
				playerId: {
					references: {
						key: 'id',
						model: 'Players'
					},
					type: DataTypes.INTEGER
				}
			},
			{
				tableName: 'Resources',
				timestamps: false
			}
		)
	}

	public async addResources( player: { guild: string, snowflake: string }, resources: { bombs?: number, coins?: number, keys?: number } ): Promise<IResourceInterface> {
		const { guild, snowflake } = player
		const { bombs, coins, keys } = resources
		const playerItem = await this.container.stores.get( 'models' ).get( 'Players' )
			.getPlayer( guild, snowflake )
		const resourcesItem = await this.model.findOne( { where: { playerId: playerItem.id } } )
			?? this.model.build( { playerId: playerItem.id } )
		return resourcesItem.increment( {
			bombs: bombs ?? 0,
			coins: coins ?? 0,
			keys: keys ?? 0
		} )
	}
}

declare global {
	interface ModelRegistryEntries {
		Resources: ResourceModel
	}
}
