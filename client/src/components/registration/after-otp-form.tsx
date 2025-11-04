"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import SubmitBtn from "../submit-btn";
import { IBackground, IField, ILevel, IOptionData } from "@/lib/type";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RedirectType, redirect } from "next/navigation";

// Schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional(),
  img: z.string().url({ message: "Must be a valid URL." }).optional(),
  level: z.string().min(1, { message: "Level is required." }),
  background: z.string().min(1, { message: "Background is required." }),
});

// Component
export default function AfterOtpForm({
  levelOptions,
  backgroundOptions,
  phone,
}: {
  levelOptions: (ILevel & { _id: string })[];
  backgroundOptions: (IBackground & { _id: string })[];
  phone: string;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      img: "",
      level: "",
      background: "",
    },
  });

  // Field config
  const fields: IField[] = [
    {
      inputType: "input",
      name: "name",
      label: "Name",
      placeholder: "Jhon Doe",
    },
    {
      inputType: "input",
      name: "email",
      label: "Email",
      placeholder: "you@example.com",
    },
    {
      inputType: "input",
      name: "img",
      label: "Image URL",
      placeholder: "https://...",
    },
    {
      inputType: "select",
      name: "level",
      label: "Level",
    },
    { inputType: "select", name: "background", label: "Background" },
  ];

  // Dependencies and source data
  const dependencies: Record<string, string | null> = {
    level: null,
    background: "level",
  };

  const fieldData: Record<string, IOptionData[]> = {
    level: levelOptions,
    background: backgroundOptions,
  };

  const [filteredOptions, setFilteredOptions] = useState<
    Record<string, IOptionData[]>
  >({});

  const watchedValues = useWatch({ control: form.control });

  // OPTIONS FILTERING BASED ON DEPENDENCIES
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log(watchedValues);

    for (const child in dependencies) {
      const parent = dependencies[child];

      if (parent && !(watchedValues as Record<string, string>)[parent]) {
        break;
      }
      console.log(child);
      console.log(dependencies[child]);

      const newFieldOptions: IOptionData[] = !parent
        ? fieldData[child]
        : fieldData[child].filter((o) => {
            if (
              (o as unknown as Record<string, { _id: string }>)[parent]?._id ===
              (watchedValues as Record<string, string>)[parent]
            ) {
              return { _id: o._id, name: o.name } as IOptionData;
            }
            return;
          });
      setFilteredOptions((prev) => {
        return {
          ...prev,
          [child]: newFieldOptions,
        };
      });
    }
  }, [watchedValues]);

  // ON SUBMIT HANDLER
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Final user info:", values);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DEVELOPMENT_API}/api/auth/create-user`,
        {
          method: "POST",
          body: JSON.stringify({ phone, ...values }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Failed to complete profile");
        return;
      }
      toast.success("Profile completed successfully!");
      return;
    } catch (error) {
      console.log(error);
      toast.error("Problem with the server.");
      return;
    }
    redirect("/", RedirectType.replace);
  };

  console.log(filteredOptions);
  return (
    <div>
      <h2 className="text-xl font-semibold text-center mb-3">
        Complete Your Profile
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name as keyof z.infer<typeof formSchema>}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    {field.inputType === "select" ? (
                      <Select onValueChange={f.onChange} value={f.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={`Select ${field.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {filteredOptions[field.name]?.map((option, i) => (
                              <SelectItem key={i} value={option?._id}>
                                {option?.name}
                              </SelectItem>
                            )) || (
                              <SelectItem value="No-value" disabled>
                                No {field.name} available
                              </SelectItem>
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input placeholder={field.placeholder} {...f} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <SubmitBtn />
        </form>
      </Form>
    </div>
  );
}
