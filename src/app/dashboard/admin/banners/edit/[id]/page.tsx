"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { BannerPreview } from "@/components/dashboard/BannerPreview"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  subtitle: z.string().optional(),
  imageUrl: z.string().url({
    message: "Please enter a valid URL for the image.",
  }),
  linkUrl: z
    .string()
    .url({
      message: "Please enter a valid URL for the link.",
    })
    .optional(),
  position: z.string({
    required_error: "Please select a position.",
  }),
  isActive: z.boolean().default(true),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  buttonText: z.string().optional(),
  buttonColor: z.string().optional(),
  priority: z.coerce.number().int().nonnegative().default(0),
})

type FormValues = z.infer<typeof formSchema>

export default function EditBannerPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewData, setPreviewData] = useState<FormValues | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { id } = params

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      imageUrl: "",
      linkUrl: "",
      position: "home_hero",
      isActive: true,
      startDate: new Date(),
      backgroundColor: "#ffffff",
      textColor: "#000000",
      buttonText: "Shop Now",
      buttonColor: "#0f172a",
      priority: 0,
    },
  })

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/admin/banners/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch banner")
        }

        const data = await response.json()
        const banner = data.banner

        // Parse dates
        const startDate = banner.startDate ? new Date(banner.startDate) : new Date()
        const endDate = banner.endDate ? new Date(banner.endDate) : undefined

        // Set form values
        form.reset({
          title: banner.title,
          subtitle: banner.subtitle || "",
          imageUrl: banner.imageUrl,
          linkUrl: banner.linkUrl || "",
          position: banner.position,
          isActive: banner.isActive,
          startDate,
          endDate,
          backgroundColor: banner.backgroundColor || "#ffffff",
          textColor: banner.textColor || "#000000",
          buttonText: banner.buttonText || "Shop Now",
          buttonColor: banner.buttonColor || "#0f172a",
          priority: banner.priority || 0,
        })

        // Set preview data
        setPreviewData({
          ...banner,
          startDate,
          endDate,
        })
      } catch (error) {
        console.error("Error fetching banner:", error)
        toast({
          title: "Error",
          description: "Failed to load banner data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBanner()
  }, [id, form, toast])

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update banner")
      }

      toast({
        title: "Success",
        description: "Banner updated successfully",
      })

      router.push("/dashboard/admin/banners")
    } catch (error) {
      console.error("Error updating banner:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update banner",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreview = () => {
    const values = form.getValues()
    setPreviewData(values)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Banners
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit Banner</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Summer Sale" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="home_hero">Home Hero</SelectItem>
                            <SelectItem value="home_middle">Home Middle</SelectItem>
                            <SelectItem value="home_bottom">Home Bottom</SelectItem>
                            <SelectItem value="category_top">Category Top</SelectItem>
                            <SelectItem value="sidebar">Sidebar</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/banner.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linkUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link URL (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/sale" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date (optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Get up to 50% off on selected items"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="backgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background Color</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <Input
                            type="color"
                            value={field.value || "#ffffff"}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-12 p-1 h-10"
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="textColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text Color</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <Input
                            type="color"
                            value={field.value || "#000000"}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-12 p-1 h-10"
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buttonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Text (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Shop Now" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buttonColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Color</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <Input
                            type="color"
                            value={field.value || "#0f172a"}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-12 p-1 h-10"
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormDescription>Higher priority banners are shown first</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <FormDescription>Make this banner visible on the site</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Banner"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handlePreview}>
                    Preview
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banner Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {previewData ? (
              <BannerPreview banner={previewData} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Click "Preview" to see how your banner will look
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

