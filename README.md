# CAESIUM
[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](https://github.com/frklan/caesium/blob/master/LICENSE)

**N.B. Very much in Alpha mode -- beware of bugs and unexpected behaviour.**

A Rest API to control Ikea Trådfri Lightbulbs. Pretty basic and unsecure. Take care not to expose the API to the world.

## Running the app

### Prerequisites

* NodeJS
* Ikea Trådfi Lightbulb
* Ikea Trådfri Gateway

### Running

1. Clone the repository ````$ git clone git@github.com:frklan/caesium.git````

2. Install dependecies with ````$ npm install ````

3. Create an .env file in the root of the project containing:

		GW_PASSWORD=<Password as printed on your Tråfri gateway>

Alternatively you can set the corresponding environment variables using your preferred method.

4. Run ```$ npm run start```

Access the API on port 5000 (or set a port in the .env file: ````PORT=<port number>````)

## API endpoints

### api/v1/bulbs
Lists current known bulbs and states

Example:

	  [
	    {
	      "name": "Table",
	      "id": 65540,
	      "light": {
	          "onOff": false,
	          "dimmer": 17.3,
	          "color": "f1e0b5",
	          "colorTemperature": 58.8,
	          "colorX": 30138,
	          "colorY": 26909,
	          "transitionTime": 0.5
	        }
	    },
	    {
	        "name": "Window",
	        "id": 65541,
	        "light": {
	            "onOff": true,
	            "dimmer": 7.9,
	            "color": "efd275",
	            "colorTemperature": 100,
	            "colorX": 30138,
	            "colorY": 26909,
	            "transitionTime": 0.5
	        }
	    }
	  ]

### api/v1/bulb/[bulb id]
Report state on a single bulb

Example:

	  [
	    {
	        "name": "Table",
	        "id": 65530,
	        "light": {
	            "onOff": false,
	            "dimmer": 17.3,
	            "color": "f1e0b5",
	            "colorTemperature": 58.8,
	            "colorX": 30138,
	            "colorY": 26909,
	            "transitionTime": 0.5
	        }
	    }
		]

### api/v1/bulb/[bulb id]/toggle
Toggles a bulb on or off

Response:

	  "{status: done}"

### api/v1/bulb/[bulb id]/[ON] || [OFF]
Switches a bulb on or off. 

Response:

	  "{status: done}"


## TODO's

- [ ] Basic authorization check before granting aceess to the API 
  
## Contributing

Contributions are always welcome!

When contributing to this repository, please first discuss the change you wish to make via the issue tracker, email, or any other method with the owner of this repository before making a change.

Please note that we have a code of conduct, you are required to follow it in all your interactions with the project.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/frklan/caesium/tags).

## Authors

* **Fredrik Andersson** - *Initial work* - [frklan](https://github.com/frklan)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details