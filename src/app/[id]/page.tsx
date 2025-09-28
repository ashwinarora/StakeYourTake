'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ClockIcon } from '@heroicons/react/24/outline'
import { useDebateContractData } from '@/hooks/useDebateContractData'
import { useConfig, usePublicClient, useWriteContract } from 'wagmi'
import { toast } from 'sonner'
import { CONTRACT_ABI, chainToContractAddress } from '@/constants'
import { SupportedChainId } from '@/config/wagmi'
import { formatUnits } from 'viem'
import { useGetEvidenceByDebateIdPg } from '@/hooks/useGetEvidenceByDebateIdPg'
import { usePostEvidence } from '@/hooks/usePostEvidence'
import { FileUploadFull } from '@/components/custom/FileUpload'

export default function DebateDetailPage() {
  const params = useParams()
  const [comment, setComment] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [assetUrl, setAssetUrl] = useState<string | undefined>(undefined)

  const { data: debateContractData, debates: debatesData, isLoading, error, refetch } = useDebateContractData()
  const debate = debatesData.find(debate => debate.id === Number(params.id))
  const debateContract = debateContractData.find(d => d.debateId === debate?.debateId)
  console.log({debateContractData, debatesData})
  console.log({debate, debateContract})

  const { data: evidences, isLoading: isEvidenceLoading, isError: isEvidenceError, error: evidenceError, refetch: refetchEvidence } = useGetEvidenceByDebateIdPg(debate?.id)

  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()
  const [isVoting, setIsVoting] = useState<boolean>(false)
  const config = useConfig()

  const shortenAddress = (address?: string) => {
    if (!address) return 'Unknown'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const totalVotes = debateContract ? Number(debateContract.yesCount) + Number(debateContract.noCount) : 0
  const yesPercent = totalVotes > 0 && debateContract ? Math.round((Number(debateContract.yesCount) / totalVotes) * 100) : 0
  const noPercent = totalVotes > 0 && debateContract ? Math.round((Number(debateContract.noCount) / totalVotes) * 100) : 0

  const chain = debate ? config.chains.find(c => c.id === debate.chainId) : undefined
  const nativeSymbol = chain?.nativeCurrency?.symbol || 'ETH'
  const nativeDecimals = chain?.nativeCurrency?.decimals || 18
  const voteFeeFormatted = debateContract ? `${formatUnits(debateContract.voteFee, nativeDecimals)} ${nativeSymbol}` : undefined

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const isVotingClosed = !!debateContract && (!!debateContract.finalized || (Date.now() / 1000 >= Number(debateContract.endTime)))

  const handleVote = async (vote: 'yes' | 'no') => {
    if (!debate || !debateContract) {
      toast.error('Debate not loaded')
      return
    }
    if (!publicClient) {
      toast.error('No public client available')
      return
    }
    if (isVotingClosed) {
      toast.error('Voting is closed for this debate')
      return
    }

    const supportYes = vote === 'yes'
    const value = debateContract.voteFee
    const address = chainToContractAddress[debate.chainId as SupportedChainId]

    try {
      setIsVoting(true)
      const hash = await writeContractAsync({
        address,
        abi: CONTRACT_ABI,
        functionName: 'vote',
        args: [BigInt(debate.debateId), supportYes],
        value,
      })
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log(receipt)
      if (receipt.status !== 'success') {
        toast.error('Transaction reverted')
        return
      }
      toast.success('Vote submitted successfully')
      await refetch()
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit vote')
    } finally {
      setIsVoting(false)
    }
  }

  const { mutateAsync: postEvidence, isPending: isPostingEvidence } = usePostEvidence()

  const handleCommentSubmit = async () => {
    if (!debate || !debateContract) {
      toast.error('Debate not loaded')
      return
    }
    if (!comment.trim()) {
      toast.error('Please enter a comment')
      return
    }
    try {
      await postEvidence({
        debateIdPg: debate.id,
        debateId: debate.debateId,
        chainId: debate.chainId as SupportedChainId,
        content: comment.trim(),
        assetUrl,
      })
      toast.success('Evidence submitted')
      setComment('')
      setSelectedFiles([])
      setAssetUrl(undefined)
      await refetchEvidence()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to submit evidence'
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* <Header /> */}
      
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
        {isLoading && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading debate...</h1>
          </div>
        )}
        {!isLoading && !debate && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Debate not found</h1>
          </div>
        )}
        {/* Debate Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {debate?.title || '—'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {debate?.description || ''}
          </p>
        </div>

        {/* Media Section */}
        {debate?.assetUrl && (
          <div className="mb-8">
            <img
              src={debate.assetUrl}
              alt={debate.title}
              className="w-full h-96 object-cover rounded-xl shadow-lg"
            />
          </div>
        )}

        {/* Creator Info */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {shortenAddress(debateContract?.creator)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Created at {debate ? new Date(debate.createdAt).toLocaleString() : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Vote Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Live Vote
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Yes Vote */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-600 dark:text-green-400 font-semibold">Yes</span>
                  <span className="text-gray-600 dark:text-gray-300">{yesPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${yesPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* No Vote */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-red-600 dark:text-red-400 font-semibold">No</span>
                  <span className="text-gray-600 dark:text-gray-300">{noPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${noPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debate Timeline */}
         <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Debate Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              
              <div className="space-y-6">
                {isEvidenceLoading && (
                  <div className="text-gray-600 dark:text-gray-300">Loading timeline...</div>
                )}

                {!isEvidenceLoading && isEvidenceError && (
                  <div className="text-red-600 dark:text-red-400">{(evidenceError as Error | undefined)?.message || 'Failed to load evidence'}</div>
                )}

                {!isEvidenceLoading && !isEvidenceError && (!evidences || evidences.length === 0) && (
                  <div className="text-gray-600 dark:text-gray-300">No evidence submitted yet.</div>
                )}

                {!isEvidenceLoading && !isEvidenceError && evidences && evidences.length > 0 && (
                  <>
                    {([...evidences]
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()))
                      .map((ev, index, arr) => {
                      const isLast = index === arr.length - 1
                      return (
                        <div key={ev.id} className="relative flex items-start space-x-4">
                          {/* Icon with connecting line */}
                          <div className="relative flex-shrink-0">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 z-10 relative">
                              <ClockIcon className="w-5 h-5" />
                            </div>
                            {/* Connecting line to next item */}
                            {!isLast && (
                              <div className="absolute left-1/2 top-8 w-0.5 h-6 bg-gray-200 dark:bg-gray-700 transform -translate-x-1/2"></div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 pb-6">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                Evidence submitted
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(ev.createdAt).toLocaleString()}
                              </span>
                            </div>

                            {ev.content && (
                              <p className="mt-2 text-gray-600 dark:text-gray-300">
                                {ev.content}
                              </p>
                            )}

                            {ev.assetUrl && (
                              <div className="mt-3 flex space-x-2">
                                <img
                                  src={ev.assetUrl}
                                  alt="Evidence"
                                  className="w-52 h-52 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comment Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Add Your Comment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Add your comment (staking required)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <FileUploadFull onUploadSuccess={(url) => setAssetUrl(url)} onFileRemove={() => setAssetUrl(undefined)} disabled={isPostingEvidence} />
                </div>
                <Button 
                  onClick={handleCommentSubmit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={isPostingEvidence || isVoting || isLoading || !debate || !debateContract}
                >
                  {isPostingEvidence ? 'Submitting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voting Section - Sticky at bottom */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 -mx-6">
          <div className="max-w-4xl mx-auto">
            {debateContract && (
              <div className="mb-2 text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between">
                <span className="font-medium">Vote fee</span>
                <span className="font-semibold">{voteFeeFormatted}</span>
              </div>
            )}
            <div className="flex space-x-4">
              <Button
                onClick={() => handleVote('yes')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold shadow-lg"
                disabled={isLoading || isVoting || !debate || !debateContract || isVotingClosed}
              >
                {isVoting ? 'Submitting...' : 'Vote Yes'}
              </Button>
              <Button
                onClick={() => handleVote('no')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-semibold shadow-lg"
                disabled={isLoading || isVoting || !debate || !debateContract || isVotingClosed}
              >
                {isVoting ? 'Submitting...' : 'Vote No'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}