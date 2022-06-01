const express = require("express")
const app = express()
require("dotenv").config()
const stripe = require("stripe")("sk_test_51KoihiSI4CWCME42CBf87EWspTUhsYgopGEXSW3eqleTi6xoCPo96sc93dwL9hNNjyGeM4ks79rSYCentsbF00pmFNc1kb")
const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


const generateResponse = intent => {
	// Generate a response based on the intent's status
	switch (intent.status) {
	  case "requires_action":
	  case "requires_source_action":
		// Card requires authentication
		return {
		  requiresAction: false,
		  clientSecret: intent.client_secret
		};
	  case "requires_payment_method":
	  case "requires_source":
		// Card was not properly authenticated, suggest a new payment method
		return {
		  error: "Your card was denied, please provide a new payment method"
		};
	  case "succeeded":
		// Payment is complete, authentication not required
		// To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
		console.log("💰 Payment received!");
		return { clientSecret: intent.client_secret };
	}
  };

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.post("/payment", async (req, res) => {
	let { amount, id } = req.body
	try {
		let intent
			id = await stripe.paymentIntents.create({
				amount,
				currency: "usd",
				description: "lunapr",
				payment_method: intent,
				confirm: true,
			})
			console.log("Payment", intent)
			intent = await stripe.paymentIntents.confirm(intent)
		// res.json({
		// 	message: "Payment successful",
		// 	success: true
		// })
		res.send(generateResponse(intent));
	} catch (error) {
		console.log("Error", error)
		res.json({
			message: "Payment failed",
			success: true
		})
	}
})


app.listen(process.env.PORT || 4000, () => {
	console.log("Sever is listening on port 4000")
})
