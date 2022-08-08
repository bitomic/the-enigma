import type { ModelStatic, Model as SequelizeModel } from 'sequelize'
import type { PieceContext, PieceOptions } from '@sapphire/pieces'
import { DataTypes } from 'sequelize'
import { Model } from '../framework'

export interface IItem {
	description: string
	id: number
	name: string
	type: 'Active' | 'Passive'
}

interface IItemInterface extends SequelizeModel<IItem, IItem>, IItem {
}

export class ItemModel extends Model<IItemInterface> {
	public readonly model: ModelStatic<IItemInterface>

	public constructor( context: PieceContext, options: PieceOptions ) {
		super( context, {
			...options,
			name: 'Items'
		} )

		this.model = this.container.sequelize.define<IItemInterface>(
			'Items',
			{
				description: DataTypes.STRING,
				id: {
					allowNull: false,
					primaryKey: true,
					type: DataTypes.INTEGER
				},
				name: DataTypes.STRING,
				type: DataTypes.STRING
			},
			{
				tableName: 'Items',
				timestamps: false
			}
		)
	}

	public getItemById( id: number ): Promise<IItemInterface | null> {
		return this.model.findOne( { where: { id } } )
	}
}

declare global {
	interface ModelRegistryEntries {
		Items: ItemModel
	}
}
