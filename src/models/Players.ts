import type { ModelStatic, Model as SequelizeModel } from 'sequelize'
import type { PieceContext, PieceOptions } from '@sapphire/pieces'
import { DataTypes } from 'sequelize'
import { Model } from '../framework'

export interface IPlayer {
	guild: string
	id: number
	snowflake: string
}

interface IPlayerInterface extends SequelizeModel<IPlayer, Omit<IPlayer, 'id'>>, IPlayer {
}

export class PlayerModel extends Model<IPlayerInterface> {
	public readonly model: ModelStatic<IPlayerInterface>

	public constructor( context: PieceContext, options: PieceOptions ) {
		super( context, {
			...options,
			name: 'Players'
		} )

		this.model = this.container.sequelize.define<IPlayerInterface>(
			'Players',
			{
				guild: DataTypes.STRING,
				id: {
					allowNull: false,
					autoIncrement: true,
					primaryKey: true,
					type: DataTypes.INTEGER
				},
				snowflake: DataTypes.STRING
			},
			{
				tableName: 'Players',
				timestamps: false
			}
		)
	}

	public async getPlayer( guild: string, snowflake: string ): Promise<IPlayerInterface> {
		return await this.model.findOne( { where: { guild, snowflake } } )
			?? this.model.create( { guild, snowflake } )
	}
}

declare global {
	interface ModelRegistryEntries {
		Players: PlayerModel
	}
}
