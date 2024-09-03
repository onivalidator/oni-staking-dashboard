/* 'use client';

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChartSpline, Atom } from 'lucide-react'
import { useChain, useChainWallet } from '@cosmos-kit/react'
import { ChainName } from '@cosmos-kit/core'
import { StdFee } from '@cosmjs/amino'

export function StakingDashboard() {
  try {
    const [stakeAmount, setStakeAmount] = useState(100)
    const [apr] = useState(15.12) // This should be fetched from an API in a real scenario
    const chainName: ChainName = 'cosmoshub'
    const { connect, disconnect, openView, status, address, getSigningCosmWasmClient } = useChain(chainName)

    // Remove this line
    // const { getSigningCosmWasmClient } = useChainWallet(chainName)

    const calculateProfit = (amount: number, period: 'daily' | 'monthly' | 'yearly') => {
      const periodMultiplier = period === 'daily' ? 1 : period === 'monthly' ? 30 : 365
      return ((amount * apr) / 100 / 365 * periodMultiplier).toFixed(2)
    }

    const handleWalletConnection = async () => {
      if (status === 'Connected') {
        await disconnect()
      } else {
        await connect()
      }
    }

    const handleStake = async () => {
      if (status !== 'Connected') {
        openView()
        return
      }

      try {
        const client = await getSigningCosmWasmClient()
        if (!client) throw new Error('No signing client')

        const fee: StdFee = {
          amount: [{ denom: 'uatom', amount: '5000' }],
          gas: '200000',
        }

        const result = await client.delegateTokens(
          address,
          'cosmosvaloper16s96n9k9zztdgjy8q4qcxp4hn7ww98qkrka4zkcosmosvaloper1clpqr4nrk4khgkxj78fcwwh6dl3uw4epsluffn', // Example validator address
          { denom: 'uatom', amount: (stakeAmount * 1000000).toString() },
          fee,
          'Staking via ONI'
        )

        console.log('Transaction hash:', result.transactionHash)
      } catch (error) {
        console.error('Staking failed:', error)
      }
    }

    const handleStakeAmountChange = (value: number) => {
      let newAmount = value;
      let step = 10;

      if (value >= 10000) {
        step = 2000;
      } else if (value >= 5000) {
        step = 1000;
      } else if (value >= 1000) {
        step = 100;
      } else if (value >= 200) {
        step = 50;
      }

      if (value > stakeAmount) {
        newAmount = Math.floor(stakeAmount / step) * step + step;
      } else if (value < stakeAmount) {
        newAmount = Math.ceil(stakeAmount / step) * step - step;
      }

      newAmount = Math.max(0, newAmount); // Ensure the amount doesn't go below 0
      setStakeAmount(newAmount);
    }

    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ChartSpline className="h-8 w-8 text-red-600" />
              <span className="text-2xl font-bold">Oni</span>
            </div>
            <nav className="hidden md:flex space-x-4">
              <a href="#" className="hover:text-red-600">Staking</a>
              <a href="#" className="hover:text-red-600">Protocols</a>
              <a href="#" className="hover:text-red-600">Business</a>
              <a href="#" className="hover:text-red-600">Blog</a>
              <a href="#" className="hover:text-red-600">About Us</a>
            </nav>
            <div className="flex space-x-2">
              <Button
                onClick={handleWalletConnection}
                variant="outline"
                className="bg-transparent border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                {status === 'Connected' ? 'Disconnect' : 'Connect Wallet'}
              </Button>
              <Button onClick={handleStake} className="bg-red-600 hover:bg-red-700">STAKE</Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto mt-8 px-4">
          <h1 className="text-4xl font-bold mb-8">DELEGATE COSMOS</h1>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-red-600">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Atom className="h-6 w-6" />
                  <span>ATOM</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-600">{apr}% APR</div>
                <p className="mt-4">Cosmos</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-red-600">
              <CardHeader>
                <CardTitle>STAKE</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">You can safely stake your COSMOS by following these steps:</p>
                <ol className="list-decimal list-inside">
                  <li>Connect your wallet</li>
                  <li>Enter the amount you want to stake</li>
                  <li>Confirm the transaction in your wallet</li>
                </ol>
                <Button onClick={handleStake} className="mt-4 w-full bg-red-600 hover:bg-red-700">STAKE NOW</Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-red-600">
              <CardHeader>
                <CardTitle>CALCULATE YOUR PROFIT</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="stakeAmount">Enter your amount</Label>
                <Input
                  id="stakeAmount"
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => handleStakeAmountChange(Number(e.target.value))}
                  step={stakeAmount >= 10000 ? 2000 : stakeAmount >= 5000 ? 1000 : stakeAmount >= 1000 ? 100 : stakeAmount >= 200 ? 50 : 10}
                  min={0}
                  className="mt-1 bg-gray-700 text-white"
                />
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Daily:</span>
                    <span className="text-red-600">{calculateProfit(stakeAmount, 'daily')} ATOM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly:</span>
                    <span className="text-red-600">{calculateProfit(stakeAmount, 'monthly')} ATOM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yearly:</span>
                    <span className="text-red-600">{calculateProfit(stakeAmount, 'yearly')} ATOM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="mt-16 bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Atom className="h-6 w-6" />
              <span>COSMOS</span>
            </div>
            <div>
              <p>CONNECTED WALLET ADDRESS</p>
              <p className="text-red-600">{address || 'Connect wallet to view address'}</p>
            </div>
          </div>
        </footer>
      </div>
    )
  } catch (error) {
    console.error('Error in StakingDashboard:', error)
    return <div>Error loading dashboard. Please check console for details.</div>
  }
}