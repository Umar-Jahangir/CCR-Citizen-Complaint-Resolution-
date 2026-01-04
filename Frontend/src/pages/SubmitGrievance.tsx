import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_DEPARTMENTS, Category } from '@/types/grievance';
import { Brain, Send, Loader2, CheckCircle2, ImagePlus, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { analyzeGrievance } from '@/services/aiService';
import { createGrievance } from '@/services/grievanceService';
import LocationPicker from '@/components/LocationPicker';

const SubmitGrievance = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as Category | '',
    location: '',
    name: '',
    phone: '',
    email: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<{ url: string; index: number } | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: Category;
    confidence: number;
    urgency: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  } | null>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const inferCategoryFromText = (text: string): Category => {
    const keywords = text.toLowerCase();
    if (keywords.includes('garbage') || keywords.includes('waste') || keywords.includes('smell') || keywords.includes('trash')) {
      return 'sanitation';
    } else if (keywords.includes('water') || keywords.includes('pipe') || keywords.includes('supply') || keywords.includes('tap')) {
      return 'water-supply';
    } else if (keywords.includes('electricity') || keywords.includes('light') || keywords.includes('power') || keywords.includes('outage')) {
      return 'electricity';
    } else if (keywords.includes('road') || keywords.includes('pothole') || keywords.includes('accident') || keywords.includes('street')) {
      return 'roads';
    } else if (keywords.includes('safety') || keywords.includes('police') || keywords.includes('crime') || keywords.includes('theft')) {
      return 'public-safety';
    } else if (keywords.includes('hospital') || keywords.includes('health') || keywords.includes('doctor') || keywords.includes('medical')) {
      return 'healthcare';
    } else if (keywords.includes('school') || keywords.includes('education') || keywords.includes('teacher')) {
      return 'education';
    } else if (keywords.includes('house') || keywords.includes('housing') || keywords.includes('building') || keywords.includes('rent')) {
      return 'housing';
    }
    return 'other';
  };

  const runAIAnalysis = useCallback(async () => {
    if (formData.description.length < 50) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeGrievance(formData.description, imagePreviews.length > 0 ? imagePreviews : undefined);

      const suggestedCategory = inferCategoryFromText(formData.description);

      setAiSuggestion({
        category: suggestedCategory,
        confidence: result.text_analysis.confidence || 0.75,
        urgency: result.overall_urgency,
        sentiment: result.text_analysis.sentiment,
      });
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast.error('AI analysis failed. Using fallback analysis.');

      const suggestedCategory = inferCategoryFromText(formData.description);
      setAiSuggestion({
        category: suggestedCategory,
        confidence: 0.6,
        urgency: 5,
        sentiment: 'neutral',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [formData.description, imagePreviews]);

  const handleDescriptionChange = (description: string) => {
    setFormData(prev => ({ ...prev, description }));

    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    if (description.length > 50) {
      analysisTimeoutRef.current = setTimeout(() => {
        runAIAnalysis();
      }, 1500);
    }
  };

  const acceptAiSuggestion = () => {
    if (aiSuggestion) {
      setFormData(prev => ({ ...prev, category: aiSuggestion.category }));
      toast.success('AI suggestion accepted!');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = images.length + newFiles.length;

    if (totalImages > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    for (const file of newFiles) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    // Create previews for new images
    const newPreviews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error('Please fill in your name and phone number');
      return;
    }

    if (!formData.title || !formData.description || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createGrievance({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        title: formData.title,
        description: formData.description,
        category: formData.category || undefined,
        location: formData.location,
        images: imagePreviews.length > 0 ? imagePreviews : undefined,
      });

      toast.success(
        <div className="space-y-1">
          <p className="font-semibold">Grievance Submitted Successfully!</p>
          <p className="text-sm">Your ticket ID: <span className="font-mono font-bold">{result.ticket_id}</span></p>
        </div>
      );

      navigate('/track', { state: { ticketId: result.ticket_id } });
    } catch (error) {
      console.error('Failed to submit grievance:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Submit Your Grievance</h1>
          <p className="text-muted-foreground">
            Describe your complaint and our AI will help route it to the right department.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Your contact details for updates</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email (optional)"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Grievance Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grievance Details</CardTitle>
              <CardDescription>Describe your complaint in detail</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief title of your complaint"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your grievance in detail. Include relevant information like when the issue started, how it affects you, etc."
                  className="min-h-[150px]"
                  value={formData.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  required
                />
                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI is analyzing your complaint...
                  </div>
                )}
              </div>

              {/* AI Category Suggestion - Simple version for users */}
              {aiSuggestion && !isAnalyzing && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
                      <Brain className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-sm">AI Suggestion</p>
                      <p className="text-sm text-muted-foreground">
                        Based on your description, this appears to be a{' '}
                        <span className="font-semibold text-foreground">
                          {CATEGORY_ICONS[aiSuggestion.category]} {CATEGORY_LABELS[aiSuggestion.category]}
                        </span>{' '}
                        issue.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Will be routed to: {CATEGORY_DEPARTMENTS[aiSuggestion.category]}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={acceptAiSuggestion}
                        className="mt-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Accept Suggestion
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Category }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (optional - AI will suggest)" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {CATEGORY_ICONS[key as Category]} {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Picker with Map */}
              <LocationPicker
                value={formData.location}
                onChange={(location) => setFormData(prev => ({ ...prev, location }))}
              />

              {formData.category && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <span className="text-muted-foreground">This will be routed to: </span>
                  <span className="font-medium">{CATEGORY_DEPARTMENTS[formData.category as Category]}</span>
                </div>
              )}

              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label>Attach Images (Optional)</Label>
                <p className="text-sm text-muted-foreground">
                  Upload up to 5 images to support your grievance (max 5MB each)
                </p>

                <div className="flex flex-wrap gap-3">
                  {/* Image Previews */}
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Upload ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-lg border cursor-pointer"
                        onClick={() => setPreviewImage({ url: preview, index })}
                      />
                      {/* Overlay with preview icon */}
                      <div
                        className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => setPreviewImage({ url: preview, index })}
                      >
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add Image Button */}
                  {images.length < 5 && (
                    <label className="h-24 w-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors">
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Add Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>

                {images.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {images.length} image{images.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit Grievance
              </>
            )}
          </Button>
        </form>

        {/* Image Preview Dialog */}
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            <DialogTitle className="sr-only">Image Preview</DialogTitle>
            {previewImage && (
              <div className="relative">
                <img
                  src={previewImage.url}
                  alt={`Preview ${previewImage.index + 1}`}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />

                {/* Navigation buttons */}
                {imagePreviews.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const newIndex = previewImage.index === 0
                          ? imagePreviews.length - 1
                          : previewImage.index - 1;
                        setPreviewImage({ url: imagePreviews[newIndex], index: newIndex });
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newIndex = previewImage.index === imagePreviews.length - 1
                          ? 0
                          : previewImage.index + 1;
                        setPreviewImage({ url: imagePreviews[newIndex], index: newIndex });
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {previewImage.index + 1} / {imagePreviews.length}
                </div>

                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SubmitGrievance;
