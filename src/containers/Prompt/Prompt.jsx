import React, { Component } from 'react';
import Input from '../../components/Input/Input';
import './Prompt.scss';
import Axios from 'axios';

class Prompt extends Component {
	constructor(props) {
		super(props);
		this.state = {
			model: "text-chat-davinci-002-20221122",
			apiKey: "",
			instruction: ``,
			conversationId: "",
			temperature: 0.5,
			question: "",
			history: [],
			maxTokens: 100
		};

		this.changeHandler = this.changeHandler.bind(this);
		this.request = this.request.bind(this);
	}

	changeHandler = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};

	request = () => {
		const data = {
			model: this.state.model,
			prompt: `Current date: ${new Date().toISOString().split('T')[0]}\n\n ${this.state.instruction}\nnow answer this single question '${this.state.question}'\n`,
			temperature: this.state.temperature,
			max_tokens: this.state.maxTokens,
		};

		const headers = {
			'Authorization': `Bearer ${this.state.apiKey}`,
			'Content-Type': 'application/json'
		};

		Axios.post('https://api.openai.com/v1/completions', data, { headers: headers })
			.then((res) => {
				console.log(res);
				this.setState({ answer: this.processResponse(res.data.choices[0].text) });
			})
			.catch((err) => {
				console.log(err);
			});
	};

	processResponse(response) {
		response = response.replace("<|im_end|>", "");
		const history = this.state.history;
		history.push({question: this.state.question, answer: response});
		this.setState({ history: history});
		return response
	}


	render() {
		return (
			<div id='prompt'>
				<div className="left">
					<Input name="apiKey" onChange={this.changeHandler} value={this.state.apiKey} label="API Key *" />
					<Input name="conversationId" onChange={this.changeHandler} value={this.state.conversationId} label="Conversation ID" />
					<Input name="temperature" onChange={this.changeHandler} value={this.state.temperature} label="Temperature" />
					<Input name="instruction" onChange={this.changeHandler} value={this.state.instruction} label="Instruction" large />
				</div>
				<div className="right">
					<Input name="question" onChange={this.changeHandler} value={this.state.question} label="Question *" />
					<button onClick={this.request}>Submit</button>
					<p>{this.state.answer}</p>
				</div>
			</div>
		);
	}
}

export default Prompt;
