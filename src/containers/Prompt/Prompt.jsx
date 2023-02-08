import React, { Component } from 'react';
import Input from '../../components/Input/Input';
import './Prompt.scss';

class Prompt extends Component {
	constructor(props) {
		super(props);
		this.state = {
			instruction: ``,
			question: "",
			history: [],
			name: "",
			email: "",
			loading: false,
			error: false,
			answer: "",
		};

		this.changeHandler = this.changeHandler.bind(this);
		this.request = this.request.bind(this);
	}

	changeHandler = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};

	request = async () => {
		const data = {
			email: this.state.email,
			name: this.state.name,
			instruction: this.state.instruction,
			message: this.state.question,
			stream: true,
		};

		this.setState({ loading: true, error: false });
		const response = fetch('http://localhost:3001', {
			body: JSON.stringify(data),
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
		})
		.then(async response => {
			const reader = response.body.getReader();
			let chunk = "";
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				}
				chunk = new TextDecoder("utf-8").decode(value);
				this.setState({ answer: chunk, loading: false });
			}
		})

	};


	render() {
		return (
			<div id='prompt'>
				<div className="left">
					<Input name="name" onChange={this.changeHandler} value={this.state.name} label="Name" />
					<Input name="email" onChange={this.changeHandler} value={this.state.email} label="Email" />
					<Input name="instruction" onChange={this.changeHandler} value={this.state.instruction} label="Instruction" large />
				</div>
				<div className="right">
					<Input name="question" onChange={this.changeHandler} value={this.state.question} label="Question *" />
					<button className='submitBtn' onClick={this.request}>Send</button>
					<p dangerouslySetInnerHTML={{__html: this.state.answer.replace('\\n', '<br/>')}}></p>
					<p>{this.state.loading ? "Loading..." : false}</p>
					<p>{this.state.error ? "Error: " + JSON.stringify(this.state.error) : false}</p>
				</div>
			</div>
		);
	}
}

export default Prompt;
