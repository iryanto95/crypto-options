## Crypto Options

[Preview available here](https://iryanto95.github.io/crypto-options/)

Spot and option market prices are fetched from Binance.

Fair Value is an expected Black-Scholes Price based on historical volatility (HV).
Implied volatility (IV) is calculated from the market price.

The first toggle between theoretical value and IV is used to determine whether the heatmap is based on gap between theoretical value and market price or between HV and IV.
The second toggle between expiry date and DTE is for the column header display.


## How to Run

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Upcoming
- Variable number of columns
- Variable number of rows
- Scrollable rows
- More "NaN"-proof IV calculation
