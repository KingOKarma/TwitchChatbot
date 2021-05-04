# TwitchWebhook
This is a test mainly for practicing how webhooks work and how twitch webhooks work/ Twitch-EventSub

---
### Setup

- run in your terminal  `npm install` or if you're using yarn `yarn`

- Rename the file `example.config.yml` to `config.yml`

- Write your parameters into the file, notes are written in the file:
```yml
clientID: Your Client ID
# When getting your client ID 
# Make sure the broadcaster you are getting the client ID for has authorised this link

#https://id.twitch.tv/oauth2/authorize?client_id=<CLIENTID>&redirect_uri=<OneOfTheLinksFromYourRedirectURL>&response_type=token&scope=bits:read%20channel:read:subscriptions
# <CLIENTID> = Your Client ID
# <OneOfTheLinksFromYourRedirectURL> = This is one of your links from the "OAuth Redirect URLs" on your twitch dev console

#Twitch Dev console can be found at:
#https://dev.twitch.tv/console/
clientSecret: This is your client secret you can obtain it from the offical twitch dev dashboard

environment: This should be either "dev" or "production" depending on which environment you are currnetly on

productionHostname: The hostname for your server MUST NOT INCLUDE "https://" EG "www.example.com" (This code works better with nginx but you can use your own provider)

proudctionPort: This should be your port number that is connected to your server (EG your nginx server port, example of nginx setup can be found in README.md)

twitchUsername: Put Your Twitch Username here in full lowercase letters


# If your hostname also has a path prefix you can go into main.ts and edit under "port" in "ReverseProxyAdapter":  "pathprefix" same case for the external port
```

### Nginx Setup

Once nginx is setup on your VPS/server/whatever go into
`/etc/nginx/sites-available` then into the file for your webserver 
You can get a domain from websites like namecheap and get an SSL certificate on cloudflare or Certbot
```
server {    
    listen 443 ssl http2;
    server_name HOSTNAME;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/certs/key.pem;


    location / {
        proxy_pass http://localhost:CHOICE_OF_PORT;

    }
}
```
HOSTNAME = productionHostname from `config.yml`
CHOICE_OF_PORT = proudctionPort from `config.yml`

### Runing the script

In your terminal just run `npm start` or `yarn start`

if you want to just use node, from the folder root run `node build/main.js` but make sure to run `tsc` before hand so the code can compile into the `build` folder 

### Running locally
This proccess is a lot more simpler compared to running on a VPS you can simply run the start scripts above as Ngrok is perferable for locally testing
