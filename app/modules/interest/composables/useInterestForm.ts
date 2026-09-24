import { computed, reactive, ref } from 'vue'
import { emptyInterestForm, type InterestFormInput } from '~~/shared/interest/types'
import { interestNeeds } from '~~/shared/interest/validate'
import { EXHIBIT_LIKE } from '~~/shared/interest/constants'

export function useInterestForm() {
  const form = reactive<InterestFormInput>(emptyInterestForm())
  const submitting = ref(false)
  const submitted = ref(false)
  const errors = ref<string[]>([])

  const needs = computed(() => {
    const n = interestNeeds(form.participation)
    return {
      ...n,
      projectDetails: n.projectBlock && form.hasProject === 'yes',
      org:
        n.org ||
        form.inOrganization === true ||
        form.participation.includes('org_booth'),
    }
  })

  const showContribute = computed(() => needs.value.contribute)
  const showProjectBlock = computed(() =>
    form.participation.some((p) => EXHIBIT_LIKE.has(p)),
  )
  const showVolunteer = computed(() => form.participation.includes('volunteer'))
  const showOrgQuestion = computed(
    () =>
      form.participation.includes('org_booth') ||
      form.participation.includes('organize') ||
      form.participation.includes('sponsor') ||
      true, // always ask lightly — plan had section 5 for everyone
  )

  function toggleParticipation(value: InterestFormInput['participation'][number]) {
    const i = form.participation.indexOf(value)
    if (i >= 0) form.participation.splice(i, 1)
    else form.participation.push(value)
  }

  function toggleCategory(value: InterestFormInput['projectCategories'][number]) {
    const i = form.projectCategories.indexOf(value)
    if (i >= 0) form.projectCategories.splice(i, 1)
    else form.projectCategories.push(value)
  }

  function toggleVolunteerArea(value: InterestFormInput['volunteerAreas'][number]) {
    const i = form.volunteerAreas.indexOf(value)
    if (i >= 0) form.volunteerAreas.splice(i, 1)
    else form.volunteerAreas.push(value)
  }

  async function submit() {
    errors.value = []
    submitting.value = true
    try {
      await $fetch('/api/interest', { method: 'POST', body: { ...form } })
      submitted.value = true
    } catch (e: unknown) {
      const err = e as { data?: { data?: { errors?: string[] }; message?: string }; statusMessage?: string }
      const list = err?.data?.data?.errors
      if (list?.length) errors.value = list
      else errors.value = [err?.statusMessage || err?.data?.message || 'Something went wrong. Try again.']
    } finally {
      submitting.value = false
    }
  }

  return {
    form,
    submitting,
    submitted,
    errors,
    needs,
    showContribute,
    showProjectBlock,
    showVolunteer,
    showOrgQuestion,
    toggleParticipation,
    toggleCategory,
    toggleVolunteerArea,
    submit,
  }
}
