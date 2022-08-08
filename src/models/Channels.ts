import type { ModelStatic, Model as SequelizeModel } from 'sequelize'
import type { PieceContext, PieceOptions } from '@sapphire/pieces'
import { DataTypes } from 'sequelize'
import { Model } from '../framework'

interface IChannel {
	channel: string
	guild: string
}

interface IChannelInterface extends SequelizeModel<IChannel, IChannel>, IChannel {
}

export class ChannelModel extends Model<IChannelInterface> {
	public readonly model: ModelStatic<IChannelInterface>

	public constructor( context: PieceContext, options: PieceOptions ) {
		super( context, {
			...options,
			name: 'Channels'
		} )

		this.model = this.container.sequelize.define<IChannelInterface>(
			'Channels',
			{
				channel: DataTypes.STRING,
				guild: DataTypes.STRING
			},
			{
				tableName: 'Channels',
				timestamps: false
			}
		)
	}

	public async addChannel( guild: string, channel: string ): Promise<void> {
		const exists = await this.model.findOne( { where: { channel, guild } } )
		if ( exists ) return
		await this.model.create( { channel, guild } )
	}

	public getRandomChannel(): Promise<IChannelInterface | null> {
		return this.model.findOne( {
			limit: 1,
			order: this.container.sequelize.random()
		} )
	}
}

declare global {
	interface ModelRegistryEntries {
		Channels: ChannelModel
	}
}
