import * as slash from "https://code.harmony.rocks/v2.0.0/deploy";
{}

// Pick up TOKEN and PUBLIC_KEY from ENV.
slash.init({ env: true });

const ACTIVITIES: {
  [name: string]: {
    id: string;
    name: string;
  };
} = {
  poker: {
    id: "755827207812677713",
    name: "Poker Night",
  },
  betrayal: {
    id: "773336526917861400",
    name: "Betrayal.io",
  },
  fishing: {
    id: "814288819477020702",
    name: "Fishington.io",
  },
  chess: {
    id: "832012774040141894",
    name: "Chess in the Park",
  },
  doodlecrew: {
    id: "878067389634314250",
    name: "DoodleCrew",
  },
  lettertile: {
    id: "879863686565621790",
    name: "LetterTile",
  },
  wordsnacks: {
    id: "879863976006127627",
    name: "WordSnacks",
  },
  watchTogether: {
    id: "880218394199220334",
    name: "Watch Together",
  },
  spellcast: {
    id: "852509694341283871",
    name: "Spellcast",
  },
  checkers: {
    id: "832013003968348200",
    name: "Checkers In The Park",
  },
};

const commands = [
   {
     name: "info",
     description: "Sends You The Information About The Bot",
   },
   {
     name: "activity",
     description: "Start an Activity in a Voice Channel.",
     options: [
      {
        name: "channel",
        type: "CHANNEL",
        description: "Voice Channel to start activity in.",
        required: true,
      },
      {
        name: "activity",
        type: "STRING",
        description: "Activity to start.",
        required: true,
        choices: Object.entries(ACTIVITIES).map((e) => ({
          name: e[1].name,
          value: e[0],
        })),
      },
    ],
  },
];

// Create Slash Commands if not present
slash.commands.all().then((e) => {
  let cmd;
  if (
    e.size !== commands.length || 
    !(cmd = e.find(e => e.name === "activity")) 
    || cmd?.options[1]?.choices?.length !== Object.keys(ACTIVITIES)
    || cmd.options[1].choices.some(e => ACTIVITIES[e.value] !== e.name)
  ) {
    slash.commands.bulkEdit(commands);
  }
});

slash.handle("activity", (d) => {
  if (!d.guild) return;
  const channel = d.option<slash.InteractionChannel>("channel");
  const activity = ACTIVITIES[d.option<string>("activity")];
  if (!channel || !activity) return;
  
  if (channel.type !== slash.ChannelTypes.GUILD_VOICE) {
    return d.reply("Activities can only be started in Voice Channels!", {
      ephemeral: true,
    });
  }

  // POST /channels/{channel.id}/invites
  // with target_type: 2,
  // and target_appliation_id: app_id of activity
  
  // Wanna curl?
  /* 
     curl -X POST \
       -H "Authorization: Bot $TOKEN" \
       -H "Content-Type: application/json" \
       https://discord.com/api/v9/channels/$CHANNEL_ID/invites \
       -d "{ \"max_age\": 604800, \"max_uses\": 0, \"target_type\": 2, \"target_application_id\": \"$APP_ID\", \"temporary\": false }"
  */
  return slash.client.rest.api.channels[channel.id].invites
    .post({
      max_age: 604800,
      max_uses: 0,
      target_application_id: activity.id,
      target_type: 2,
      temporary: false,
    })
    .then((inv) => {
      return d.reply(
        `[Click here to start ${activity.name} in ${channel.name}.](<https://discord.gg/${inv.code}>)`
      );
    })
    .catch((e) => {
      console.error("Starting Activity Failed", e);
      return d.reply("Failed to start Activity.", { ephemeral: true });
    });
});

slash.handle("info", (d) => {
  return d.reply(
    `• [Privacy Policy](<https://github.com/AnthonyVTdev/ActivitiesBot/blob/main/Policy.md>)\n` +
      `• [Support Server.](<https://discord.gg/ZAzGRFTv59>)\n` +
      `• Original Bot Made By [Anthony van Tonder](<https://github.com/AnthonyVTdev>) ([ActivitesBot](<https://github.com/AnthonyVTdev/ActivitiesBot>))`,
    { ephemeral: true },
  );
});

// Handle for any other commands received.
slash.handle("*", (d) => d.reply("Unhandled Command", { ephemeral: true }));
// Log all errors.
slash.client.on("interactionError", console.error);
