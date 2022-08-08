import type { ModelStatic, Model as SequelizeModel } from 'sequelize'
import type { PieceContext, PieceOptions } from '@sapphire/pieces'
import { DataTypes } from 'sequelize'
import { Model } from '../framework'

export interface IInventory {
	amount: number
	itemId: number
	playerId: number
}

interface IInventoryInterface extends SequelizeModel<IInventory, Omit<IInventory, 'amount'>>, IInventory {
}

export class InventoryModel extends Model<IInventoryInterface> {
	public readonly model: ModelStatic<IInventoryInterface>

	public constructor( context: PieceContext, options: PieceOptions ) {
		super( context, {
			...options,
			name: 'Inventories'
		} )

		this.model = this.container.sequelize.define<IInventoryInterface>(
			'Inventories',
			{
				amount: {
					defaultValue: 1,
					type: DataTypes.INTEGER
				},
				itemId: {
					references: {
						key: 'id',
						model: 'Items'
					},
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
				tableName: 'Inventories',
				timestamps: false
			}
		)
	}

	public async addItem( player: { guild: string, snowflake: string }, itemId: number ): Promise<IInventoryInterface> {
		const { guild, snowflake } = player
		const playerItem = await this.container.stores.get( 'models' ).get( 'Players' )
			.getPlayer( guild, snowflake )
		let instance = await this.model.findOne( { where: { itemId, playerId: playerItem.id } } )
		if ( instance ) {
			instance.amount++
		} else {
			instance = this.model.build( { itemId, playerId: playerItem.id } )
		}
		return instance.save()
	}

	public async removeItem( player: { guild: string, snowflake: string }, itemId: number ): Promise<IInventoryInterface | null> {
		const { guild, snowflake } = player
		const playerItem = await this.container.stores.get( 'models' ).get( 'Players' )
			.getPlayer( guild, snowflake )
		const instance = await this.model.findOne( { where: { itemId, playerId: playerItem.id } } )
		if ( !instance ) return null

		instance.amount--
		if ( instance.amount <= 0 ) {
			await instance.destroy()
			return null
		} else {
			return instance.save()
		}
	}
}

declare global {
	interface ModelRegistryEntries {
		Inventories: InventoryModel
	}
}
