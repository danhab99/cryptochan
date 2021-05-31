- [Schemas](#schemas)
  - [Post](#post)
  - [Manifest](#manifest)
  - [User](#user)
- [Protocols](#protocols)
  - [Signature protocol](#signature-protocol)
  - [Hash protocol](#hash-protocol)
  - [REST Api](#rest-api)

# Schemas

## Post

```xml
<entry>
  <author name="" publickey="" />
  <hash algorithm=""></hash>
  <signature></signature>
  <url></url>
  <parenthash></parenthash>
  <replies blocked="true|false" />

  <body type="text/*"></body>
  <published></published>
  <category></category>
  <tag></tag>
  <tag></tag>
  <tag></tag>

  <embed hash="" algorithm="" mimetype="" size=""/>
  <embed hash="" algorithm="" mimetype="" size=""/>
  <embed hash="" algorithm="" mimetype="" size=""/>
</entry>
```

## Manifest

```xml
<manifest>
  <title></title>
  <icon type="" url="">
  <description></description>

  <categories>
    <category></category>
    <category></category>
    <category></category>
  </categories>

  <policy>
    <publickey required="true|false" preapproved="true|false" />

    <posting requiresapproval="true|false">
      <rule></rule>
      <rule></rule>
      <rule></rule>
    </posting>

    <embeds maxcount="" maxsize="">
      <rule mimetype="" accept="true|false">
      <rule mimetype="" accept="true|false">
      <rule mimetype="" accept="true|false">
    </embeds>
  </policy>
</manifest>
```

## User

```xml
<user>
  <publickey algorithm=""></publickey>
  <name></name>
  <profilepic hash="" algorithm="" mimetype="" size="">
  <description></description>
  <verify></verify>
</user>
```

# Protocols

## Signature protocol

```python
from base64 import b64encode

def doSign(algorithm, entry):
  return algorithm(
    entry.parenthash +
    entry.author.name +
    entry.url +
    entry.body +
    entry.body.type +
    entry.published +
    entry.category +
    "".join(entry.tags) +
    "".join(embed.id + embed.mimetype + embed.size + b64encode(embed.bits) for embed in entry.embeds)
  )

```

## Hash protocol

```python
from base64 import b64encode

def doHash(algorithm, entry):
  return algorithm(
    entry.parenthash +
    doSign(''' signingAlgorithm ''', entry) +
    entry.author.name +
    entry.author.publickey +
    entry.url +
    entry.body +
    entry.body.type +
    entry.published +
    entry.category +
    "".join(entry.tags) +
    "".join(embed.hash +
          embed.algorithm +
          embed.mimetype +
          embed.size +
          b64encode(embed.bits)
        for embed in entry.embeds)
  )

```

## REST Api

Any time there's an `[]` theres gonna be a `?page=` argument

If the path ends in `.rss` return an rss2.0 feed

If the path ends in `.atom` return an atom feed

- `GET /m` => manifest
- `GET /c/:category` => entry[]
- `GET /p/:hash` => entry
- `GET /p/:hash/r` => entry[] replies
- `POST /p` <== form with an entry and all embeds
- `GET /e/:hash` => embed file
- `GET /u` => user[]
- `GET /u/:publickey` => user
- `GET /u/:publickey/p` => entry[]
- `POST /u` <== regiester new user
- `PUT /u` <== update user data
