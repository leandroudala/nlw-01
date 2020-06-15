import {Request, Response } from 'express'
import knex from '../database/connection'

class PointsController{
    async index(req: Request, res: Response) {
        const { city, state, items } = req.query

        const parsedItems = String(items)
            .split(',')
            .map(id => { return Number(id.trim())})

        const points = await knex.select('points.*')
            .from('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('state', String(state))
            .distinct()

        const serializePoints= points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.15.164:3333/uploads/${point.image}`
            }
        })

        return res.json(serializePoints)
    }

    async create(req: Request, res: Response){
        const {name, email, whatsapp, latitude, longitude, city, state, items} = req.body

        const imageURL = req.file.filename
        const point = {
            image: imageURL, name, email, whatsapp, latitude, longitude, city, state
        }

        // transaction 
        const trx = await knex.transaction()
        // save point in database
        const insertedId = await trx('points').insert(point)
        const point_id = insertedId[0]
    
        const pointItems = items
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
            return {
                item_id, 
                point_id
            }
        })
    
        await trx('point_items').insert(pointItems)

        await trx.commit()
    
        return res.json({id: point_id, ...point, items})
    }

    async show(req: Request, res: Response){
        const { id } = req.params

        const point = await knex('points').where('id', id).first()

        if (!point) {
            return res.status(404).json({message: 'Ponto não encontrado'})
        }

        const items = await knex('items')
            .select('items.name')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)

        const serializedPoint = {
            ...point,
            image_url: `http://192.168.15.164:3333/uploads/${point.image}`

        }
    
        return res.json({serializedPoint, items})
    }
}

export default PointsController