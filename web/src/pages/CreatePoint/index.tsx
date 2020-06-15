import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import {FiArrowLeft} from 'react-icons/fi'
import {Map, TileLayer, Marker} from 'react-leaflet'
import api from '../../services/api'
import axios from 'axios'

import Dropzone from '../../components/Dropzone'

import './styles.css'

import logo from '../../assets/logo.svg'
import { LeafletMouseEvent } from 'leaflet'

// sempre que criar estado para array ou objeto, deve informar o tipo da variável que será recebida
interface Item {
    id: number
    name: string 
    image_url: string
}
interface State {
    id: number
    sigla: string
}
interface IBGECityResponse {
    id: number
    nome: string
}

const CreatePoint = () => {
    const [initialPosition, setinitialPosition] = useState<[number, number]>([0, 0])

    const [items, setItems] = useState<Item[]>([])
    const [states, setStates] = useState<string[]>([])
    const [selectedUf, setSelectedUf] = useState<string>()
    const [cities, setCities] = useState<IBGECityResponse[]>([])
    const [selectedCity, setSelectedCity] = useState<string>()
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])
    const [selectedFile, setSelectedFile] = useState<File>()

    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const history = useHistory()
    

    const [formData, setFormData] = useState({
        name: '', email: '', whatsapp: ''
    })

    useEffect(() => {
        api.get('items').then(res => {
            setItems(res.data)
        })
    }, [])

    useEffect(()=> {
        axios.get<State[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
            const ufInitials = res.data.map(uf => uf.sigla)
            setStates(ufInitials)
        })
    }, [])

    useEffect(() => {
        // carregar cidades sempre que states mudar
        if (selectedUf === '0') {
            return
        }

        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(res => {
                const cityName = res.data.map(city => city)
                setCities(cityName)
        })
    }, [selectedUf])

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude}  = pos.coords
            setinitialPosition([latitude, longitude])
        })
    }, [])

    function handleSelectState(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value
        setSelectedUf(uf)
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value
        setSelectedCity(city)
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const {name, value} = event.target
        setFormData({
            ...formData, [name]: value
        })
    }

    function handleSelectItem(id: number) {
        const alreadySelected = selectedItems.findIndex(item => item === id)
        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id)
            setSelectedItems(filteredItems)
        } else {
            setSelectedItems([...selectedItems, id])
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()

        const {name, email, whatsapp } = formData
        const state = selectedUf 
        const city = selectedCity 
        const [latitude, longitude] = selectedPosition
        const items = selectedItems

        const data = new FormData()

        
        data.append('name', name)
        data.append('email', email)
        data.append('whatsapp', whatsapp)
        data.append('state', String(state))
        data.append('city', String(city))
        data.append('latitude', String(latitude))
        data.append('longitude', String(longitude))
        data.append('items', items.join(','))

        if (selectedFile) {
            data.append('image', selectedFile)
        }

        await api.post('points', data).catch(err => {
            console.log(err)
            alert('Ocorreu um erro.')
        })

        alert('Ponto de coleta criado')

        history.push('/')
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do<br />ponto de coleta</h1>
 
                <Dropzone onFileUploaded={setSelectedFile} />
                
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" id="name" name="name" onChange={handleInputChange} autoFocus />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" name="email" id="email" onChange={handleInputChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">WhatsApp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' 
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="state">Estado (UF)</label>
                            <select name="state" id="state" onChange={handleSelectState} value={selectedUf}>
                                <option value="0">Selecione uma UF</option>
                                {
                                    states.map(uf => (
                                        <option value={uf} key={uf}>{uf}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cdade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                                <option value="0">Selecione uma cidade</option>
                                {
                                    cities.map(city => (
                                        <option key={city.id} value={city.nome}>{city.nome}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>
                    
                    <ul className="items-grid">
                        {
                            items.map(item => (
                                <li key={item.id} 
                                    onClick={() => 
                                    handleSelectItem(item.id)} 
                                    className={selectedItems?.includes(item.id) ? 'selected' : ''}>
                                    <img src={item.image_url} alt={item.name} />
                                    <span>{item.name}</span>
                                </li>
                            ))
                        }
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint