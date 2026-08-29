"use client";

import { useActionState } from "react";
import type { Profile } from "@prisma/client";
import { saveProfileAction } from "@/lib/actions/profile";
import { Field, inputClass } from "./field";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
] as const;

const ACTIVITY_LEVEL_OPTIONS = [
  { value: "SEDENTARY", label: "Sedentary (little to no exercise)" },
  { value: "LIGHT", label: "Light (exercise 1–3 days/week)" },
  { value: "MODERATE", label: "Moderate (exercise 3–5 days/week)" },
  { value: "ACTIVE", label: "Active (exercise 6–7 days/week)" },
  { value: "VERY_ACTIVE", label: "Very active (hard exercise daily)" },
] as const;

const GOAL_OPTIONS = [
  { value: "LOSE", label: "Lose weight" },
  { value: "MAINTAIN", label: "Maintain weight" },
  { value: "GAIN", label: "Gain weight" },
] as const;

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, isPending] = useActionState(
    saveProfileAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <Field label="Name">
        <input
          name="name"
          type="text"
          required
          defaultValue={profile?.name}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Age">
          <input
            name="age"
            type="number"
            required
            min={13}
            max={120}
            defaultValue={profile?.age}
            className={inputClass}
          />
        </Field>

        <Field label="Gender">
          <select
            name="gender"
            required
            defaultValue={profile?.gender ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Select…
            </option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Weight (kg)">
          <input
            name="weightKg"
            type="number"
            required
            step="0.1"
            min={20}
            max={400}
            defaultValue={profile?.weightKg}
            className={inputClass}
          />
        </Field>

        <Field label="Height (cm)">
          <input
            name="heightCm"
            type="number"
            required
            step="0.1"
            min={100}
            max={250}
            defaultValue={profile?.heightCm}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Activity level">
        <select
          name="activityLevel"
          required
          defaultValue={profile?.activityLevel ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Select…
          </option>
          {ACTIVITY_LEVEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Goal">
        <select
          name="goal"
          required
          defaultValue={profile?.goal ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Select…
          </option>
          {GOAL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending
          ? "Saving…"
          : profile
            ? "Save changes"
            : "Continue to Dashboard"}
      </button>
    </form>
  );
}
