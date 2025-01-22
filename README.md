# Api Stubber

This is a really simple tool, that acts as a proxy for APIs. It was made so users could test how their applications would react to an error return from an external API locally.

## How to install

This requires NodeJs to be installed on your system, please take a look [here](https://nodejs.org/en/download) to install it.

1. First you will need to clone the repo:
```bash
$ git clone git@github.com:Gustrb/api-stubber.git
```

2. Install the dependencies:
```bash
$ npm i
```

3. Then, you can simply run:
```bash
$ npm run start 
``` 

Note: by default, we follow the config file at the path: `./config.json` and use port 3000. If you want to change any of those you can, simply:
```bash
$ PROXY_CONFIG_FILE="path-to-your-config" PORT="A_PORT" npm run start 
```

## How to configure it

There is a config file that can be configured using the `PROXY_CONFIG_FILE` environment variable. This variable must point to the path of a configuration file using json in the following format:
```json
{
	"fallbackUrl": "the url that is going the be ran if no route matches",
	"routes": [
		{
			"path": "the request path that is going to be matched, can be a parameter (:id for example)",
			"method": "the http method that is going to be matched",
			"status": "the status the proxy will send back",
			"body": "the body of the response"
		}
	]
}
```
