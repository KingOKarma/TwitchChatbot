# TwitchWebhook

This is a twitchbot that can detect all kind of events and run custom commands, auto commands and send twitch chat to discord!

---

### Setup

- run in your terminal `npm install` or if you're using yarn `yarn`

- Create a file called `users.yml` this file will contain things like automessages, custom commands and blocked users

file contents:

```yml
autoMsgs: []
blocked: []
canSendMessage: true
customCommands: []
```

- Rename the file `example.config.yml` to `config.yml`

- Write your parameters into the file, notes are written in the file:

```yml
accessToken: Your access Token
# This will be shown when using the link below in the url address, make sure this access token was allowed

botAccessToken: This is the access Token used for the bot account
# using your chatbot of choice's token (This is to allows the bot to view and type in chat)

botToken: This is your DISCORD BOT TOKEN

botUsername: This is your TWITCH BOT's username (In lower case)

clientID: Your Client ID
# When getting your client ID
# Make sure the broadcaster you are getting the client ID for has authorised this link

#https://id.twitch.tv/oauth2/authorize?client_id=<CLIENTID>&redirect_uri=<OneOfTheLinksFromYourRedirectURL>&response_type=token&scope=bits:read%20channel:read:subscriptions
# <CLIENTID> = Your Client ID
# <OneOfTheLinksFromYourRedirectURL> = This is one of your links from the "OAuth Redirect URLs" on your twitch dev console

#Twitch Dev console can be found at:
#https://dev.twitch.tv/console/
clientSecret: This is your client secret you can obtain it from the offical twitch dev dashboard

discordChatChannelID: "This needs to be the channel ID for the discord channel that you want messages to go to"

environment: This should be either "dev" or "production" depending on which environment you are currnetly on

eventsChannelID: This is the discord channel ID for the channel that you want twitch events to be sent to

prefix: Your Prefix here

productionHostname: The hostname for your server MUST NOT INCLUDE "https://" EG "www.example.com" (This code works better with nginx but you can use your own provider)

proudctionPort: This should be your port number that is connected to your server (EG your nginx server port)

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

### What if I don't have a redirect URL?

Well I can't exactly help you setup your own domain and everything on cloudflare/nginx but I can help you with a redirect URL for your Client ID, on your twitch dev console:
![](https://i.imgur.com/YADhNZ9.png)

- Make a new application (If you have already then click the one you want in the "Name" selections below).

![](https://i.imgur.com/oZYZJnN.png)

- Next up Put in your client's name and for the OAuth Redirect URLs you can add the website `https://redirect.bucketbot.dev` this will be important for later.
  Then select chat bot (If you're making something else then choose that).

- After that you'll be redirected to the Twitch Dev console again, just simply click your Client, in you'll now see your Client ID if you scroll down, also generate the New secret so you can use that for later on in the `config.yml`

![](https://i.imgur.com/Vxoscln.png)

- Once this is done you can now go to the link:

https://id.twitch.tv/oauth2/authorize?client_id=CLIENT_ID_GOES_HERE&redirect_uri=https://redirect.bucketbot.dev&response_type=token&scope=bits:read%20channel:read:subscriptions%20chat:read%20chat:edit

- with replacing the `CLIENT_ID_GOES_HERE` with your client ID
  It's also worth noting that you can change the permission scopes by adding the scopes to the end of the link, in this link its:

  - `bits:read`
  - `channel:read:subscriptions`
  - `chat:read`
  - `chat:edit`

  ##### REMEMBER

  You must do this same proccess with getting your chatbot's access token (You can use the same Client ID but you need both access tokens, If the redirect auto logs you in try using incogneto mode or something.)

You can split these up either with a space for with `&20`

You can find a list of scopes [here](https://dev.twitch.tv/docs/authentication/#scopes)

After authorising you'll be redirected to https://redirect.bucketbot.dev
With your access token being at the top of the page:

![](https://i.imgur.com/KwvtKvc.png)

If you go to this website normally without authorising the website will look like this:

![](https://i.imgur.com/AKlFE55.png)
