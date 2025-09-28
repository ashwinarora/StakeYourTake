"use client"
import { useState } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileUploadFull } from "./FileUpload"
import { X } from "lucide-react"
import { useChainId, useConfig, usePublicClient, useWriteContract } from "wagmi"
import { getSYTContract } from "@/lib/contract"
import { SupportedChainId } from "@/config/wagmi"
import { chainToContractAddress } from "@/constants"
import { parseEther } from "viem"
import { usePostDebate } from "@/hooks/usePostDebate"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { cn } from "@/lib/utils"
import { TimePicker } from "../ui/time-picker"

const formSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  // accept decimal input as string and validate via parseEther
  amount: z
    .string()
    .min(1)
    .refine((val) => {
      try {
        return parseEther(val) >= BigInt(0)
      } catch {
        return false
      }
    }, { message: "Enter a valid amount like 0.00001" }),
  assetUrl: z.string().optional(),
  endDate: z.date(),
  endTime: z.string().min(1, "End time is required.")
});

interface CreateDebateModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateDebateModal({ isOpen, onClose }: CreateDebateModalProps) {
  const [assetUrl, setAssetUrl] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const chainId = useChainId()
  const { chains } = useConfig()
  const activeChain = chains.find((c) => c.id === chainId)
  const nativeSymbol = activeChain?.nativeCurrency?.symbol ?? "ETH"
  const [isYesVote, setIsYesVote] = useState<boolean>(true)
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { mutateAsync: postDebate } = usePostDebate()

  const contract = getSYTContract(chainId as SupportedChainId)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetUrl: "",
      amount: ""
    }
  })

  const handleUploadSuccess = (url: string) => {
    setAssetUrl(url)
    form.setValue("assetUrl", url)
    toast.success("File uploaded successfully!")
  }

  const handleFileRemove = () => {
    setAssetUrl("")
    form.setValue("assetUrl", "")
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!publicClient) return;
    setIsSubmitting(true)
    try {
      const { amount, endDate, endTime: endTimeStr } = values
      // Build end timestamp in seconds from date + time pickers
      if (!endDate || !endTimeStr) {
        toast.error("Please select end date and time")
        return
      }
      const [hourStr, minuteStr] = endTimeStr.split(":")
      const hours = Number(hourStr)
      const minutes = Number(minuteStr)
      if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        toast.error("Invalid end time format")
        return
      }
      const end = new Date(endDate)
      end.setHours(hours, minutes, 0, 0)
      const endSeconds = Math.floor(end.getTime() / 1000)
      const nowSeconds = Math.floor(Date.now() / 1000)
      if (endSeconds <= nowSeconds) {
        toast.error("End time must be in the future")
        return
      }
      const endTime = BigInt(endSeconds)
      const contractAddress = chainToContractAddress[chainId as SupportedChainId]
      let voteFeeWei: bigint = BigInt(0)
      try {
        voteFeeWei = parseEther(amount || "0")
      } catch {
        toast.error("Invalid amount. Use decimals like 0.00001")
        return
      }
      console.log("endTime", endTime)
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: contract.abi,
        functionName: "createDebate",
        args: [endTime, isYesVote, voteFeeWei],
        value: voteFeeWei,
      })
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      await postDebate({
        title: values.title,
        description: values.description,
        assetUrl: assetUrl || undefined,
        txHash: hash,
        chainId: chainId as SupportedChainId,
      })
      console.log(receipt)
      toast.success("Debate created successfully")
      onClose()
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to create debate. Please try again.");
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={() => { if (!isSubmitting) onClose() }}
    >
      {/* Background gradient effects similar to landing page */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-0 right-0 left-1/2 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
        >
          <div
            style={{
              clipPath:
                'polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)',
            }}
            className="aspect-801/1036 w-200.25 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20"
          />
        </div>
      </div>

      <div
        className="relative bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Create New Debate</h2>
              <p className="text-gray-300 text-sm mt-1">Start a meaningful discussion and stake your opinion</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-white/10 text-gray-300 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 bg-gray-900/50">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-white">Debate Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What's your debate about?"
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your debate topic in detail..."
                      className="resize-none bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20 min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-white">Stake Amount ({nativeSymbol})</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0.00"
                      type="text"
                      inputMode="decimal"
                      className="bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">End Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? field.value.toDateString() : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            className="w-full rounded-md border border-border bg-background p-2 focus:border-ring"
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">End Time</FormLabel>
                    <FormControl>
                      <TimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select end time"
                        className="bg-background border-border focus:border-ring"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold text-white block mb-2">Your Initial Vote</label>
              <div className="flex gap-6 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="initialVote"
                    value="yes"
                    checked={isYesVote}
                    onChange={() => setIsYesVote(true)}
                    className="form-radio text-indigo-600 bg-gray-800 border-gray-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-white">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="initialVote"
                    value="no"
                    checked={!isYesVote}
                    onChange={() => setIsYesVote(false)}
                    className="form-radio text-rose-600 bg-gray-800 border-gray-600 focus:ring-rose-500"
                  />
                  <span className="ml-2 text-white">No</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-white">Attachments</label>
              <div className="bg-gray-800/30 border border-gray-600/30 rounded-lg p-4">
                <FileUploadFull
                  onUploadSuccess={handleUploadSuccess}
                  onFileRemove={handleFileRemove}
                />
              </div>
              {assetUrl && (
                <div className="text-xs text-green-400 bg-green-900/20 border border-green-500/30 rounded px-2 py-1">
                  ✓ File uploaded: {assetUrl.split('/').pop()}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => { if (!isSubmitting) onClose() }}
                className="flex-1 bg-transparent border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-500"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Debate"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
