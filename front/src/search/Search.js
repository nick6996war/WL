import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import "./Search.css"
class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            responseToPost: '',
        }
        this.addSubmit = this.addSubmit.bind(this)
        this.deleteSubmit=this.deleteSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleSubmitAZ = this.handleSubmitAZ.bind(this)
    }
    handleSubmitAZ = async e => {
        const response = await fetch('http://localhost:8080/movie/az')
        const body = await response.text()
        let bodyarr = await JSON.parse(body)
        console.log(bodyarr)
        let sent
        for (let i = 0; i < bodyarr.length; i++) {
            sent += JSON.stringify(bodyarr[i]).replace(/,/g, '\r\n').replace(/{|"|/g, '').replace(/}/g, '\r\n\r\n\r\n').toUpperCase()
        }
        this.setState({ responseToPost: sent })
    }
    addSubmit= async e => {
        e.preventDefault()
        fetch('http://localhost:8080/movie/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ post: this.state.value }),

        })
    }

    handleChange(event) {
        this.setState({ value: event.target.value })
    }

    handleSubmit = async e => {
        e.preventDefault();
        const response = await fetch('http://localhost:8080/movie/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ post: this.state.value }),

        })
        const body = await response.text();
        let bodyarr = await JSON.parse(body)
        if (bodyarr.length!=0){
        console.log(bodyarr)
        let sent
        for (let i = 0; i < bodyarr.length; i++) {
            sent += JSON.stringify(bodyarr[i]).replace(/,/g, '\r\n').replace(/{|"/g, '').replace(/}/g, '\r\n\r\n\r\n').toUpperCase()
        }
        this.setState({ responseToPost: sent });}else{
            this.setState({ responseToPost:'Error 404'})
        }
    }
    deleteSubmit = async e => {
        fetch('http://localhost:8080', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post: this.state.value }),
    })}
    render() {
        return (
            <div >
                <div className='searchLine'>
                    <form onSubmit={this.handleSubmit}>
                        <input className='inp' type="text" value={this.state.value} onChange={this.handleChange} />
                        <input className='btn' type="submit" value='Search' />
                    </form>
                    <button className='btnAZ' onClick={this.handleSubmitAZ}>A-Z</button>
                    <button className='btnADD' onClick={this.addSubmit}>ADD</button>
                    <button className='btnDL' onClick={this.deleteSubmit}>DELETE</button>
                    
                </div>
                <div className='filmList'>
                    <pre> {this.state.responseToPost.replace('undefined','')}</pre>
                </div>
            </div>
        )
    }
}

ReactDOM.render(
    <Search />,
    document.getElementById('root')
)
export default Search