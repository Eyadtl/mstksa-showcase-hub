import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { handleError } from "@/lib/error-handling";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Zod validation schema for contact form
const contactFormSchema = z.object({
  name: z.string().min(2, "forms:validation.nameMin"),
  email: z.string().email("forms:validation.invalidEmail"),
  phone: z.string().optional(),
  subject: z.string().min(5, "forms:validation.subjectMin"),
  message: z.string().min(10, "forms:validation.messageMin"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const ContactModal = ({ open, onOpenChange }: ContactModalProps) => {
  const { t } = useLanguage();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Save form data to Supabase contact_submissions table
      const { error } = await supabase
        .from("contact_submissions")
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject,
          message: data.message,
          status: "new",
        });

      if (error) {
        // Handle specific database errors
        if (error.code === '23505') {
          toast.error(t("forms:contact.errorMessage") + " (Duplicate submission)");
        } else {
          handleError(error, 'submit contact form');
        }
        return;
      }

      // Show success toast
      toast.success(t("forms:contact.successMessage"));
      
      // Clear form fields
      reset();
      
      // Close modal
      onOpenChange(false);
    } catch (error) {
      // Handle unexpected errors with detailed logging
      handleError(error, 'submit contact form', {
        customMessage: t("forms:contact.errorMessage"),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="contact-form-description">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold brand-serif text-left rtl:text-right">
            {t("forms:contact.title")}
          </DialogTitle>
          <p id="contact-form-description" className="sr-only">
            {t("forms:contact.description")}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-left rtl:text-right block">
              {t("forms:contact.name")} *
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={t("forms:contact.namePlaceholder")}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive text-left rtl:text-right">
                {t(errors.name.message as string)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-left rtl:text-right block">
              {t("forms:contact.email")} *
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder={t("forms:contact.emailPlaceholder")}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive text-left rtl:text-right">
                {t(errors.email.message as string)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-left rtl:text-right block">
              {t("forms:contact.phone")}
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder={t("forms:contact.phonePlaceholder")}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-destructive text-left rtl:text-right">
                {t(errors.phone.message as string)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-left rtl:text-right block">
              {t("forms:contact.subject")} *
            </Label>
            <Input
              id="subject"
              {...register("subject")}
              placeholder={t("forms:contact.subjectPlaceholder")}
              disabled={isSubmitting}
            />
            {errors.subject && (
              <p className="text-sm text-destructive text-left rtl:text-right">
                {t(errors.subject.message as string)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-left rtl:text-right block">
              {t("forms:contact.message")} *
            </Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder={t("forms:contact.messagePlaceholder")}
              rows={4}
              disabled={isSubmitting}
            />
            {errors.message && (
              <p className="text-sm text-destructive text-left rtl:text-right">
                {t(errors.message.message as string)}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold transition-smooth"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin rtl:ml-2 rtl:mr-0" />
                {t("forms:contact.sending")}
              </>
            ) : (
              t("forms:contact.send")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
