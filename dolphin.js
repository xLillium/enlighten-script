// Constants
const EXCHANGE_API_URL =
  "https://www.pathofexile.com/api/trade/exchange/Crucible";
const MAX_CHAOS_AMOUNT = 55;

// Configuration
const exchangeRequestConfig = {
  headers: {
    accept: "*/*",
    "content-type": "application/json",
  },
  body: '{"query":{"status":{"option":"online"},"have":["chaos"],"want":["the-enlightened"],"minimum":2},"sort":{"have":"asc"},"engine":"new"}',
  method: "POST",
};

// Fetch and process data
let numExecutions = 0;
function fetchData() {
  console.log(`\n---- Script execution number ${++numExecutions} ----\n`);
  fetch(EXCHANGE_API_URL, exchangeRequestConfig)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
    })
    .then((data) => {
      const exchangeResult = data.result;
      if (
        typeof exchangeResult === "object" &&
        !Array.isArray(exchangeResult)
      ) {
        const matchingOffers = findMatchingOffers(exchangeResult);
        if (matchingOffers.length > 0) {
          displayMatchingOffers(matchingOffers);
        } else {
          console.log("No matching trades found");
        }
      } else {
        console.log("Exchange result is not an object");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

// Find matching offers
function findMatchingOffers(exchangeResult) {
  const matchingOffers = [];
  for (const property in exchangeResult) {
    if (Object.hasOwnProperty.call(exchangeResult, property)) {
      const tradeOffer = exchangeResult[property];
      const listing = tradeOffer.listing;
      const offers = listing.offers;
      const matchingOffer = offers.find(
        (offer) =>
          offer.exchange.currency === "chaos" &&
          offer.exchange.amount <= MAX_CHAOS_AMOUNT
      );
      if (matchingOffer) {
        matchingOffers.push({
          chaosPricePerCardMessage: getChaosPricePerCardMessage(
            matchingOffer.exchange
          ),
          inGameWhisperMessage: getInGameWhisperMessage(
            listing.account.lastCharacterName,
            matchingOffer.exchange,
            matchingOffer.item.stock
          ),
        });
      }
    }
  }
  return matchingOffers;
}

// Display matching offers
function displayMatchingOffers(matchingOffers) {
  console.log("----------------------------");
  for (const offer of matchingOffers) {
    console.log(offer.chaosPricePerCardMessage);
    console.log(offer.inGameWhisperMessage);
    console.log("----------------------------");
  }
}

// Format displayed message showing the Chaos orb price per Enlightened card for this trade
function getChaosPricePerCardMessage(exchange) {
  const chaosPricePerCard = exchange.whisper.replace("{0}", exchange.amount);
  return `Price per card: ${chaosPricePerCard}`;
}

// Format displayed message to send an in-game whisper to execute the trade
function getInGameWhisperMessage(lastCharacterName, exchange, stock) {
  const totalChaosPrice = exchange.amount * stock;
  return `@${lastCharacterName} Hi, I'd like to buy your ${stock} The Enlightened for my ${totalChaosPrice} Chaos Orb in Crucible`;
}

// Run the function every 30 seconds
setInterval(fetchData, 30000);
