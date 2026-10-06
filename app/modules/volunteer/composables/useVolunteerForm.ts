import { reactive, ref } from 'vue'
import { emptyVolunteerForm, type VolunteerFormInput } from '~~/shared/volunteer/types'

export function useVolunteerForm() {
  const form = reactive<VolunteerFormInput>(emptyVolunteerForm())
  const submitting = ref(false)
  const submitted = ref(false)
  const errors = ref<string[]>([])

  function toggleDomain(value: VolunteerFormInput['domains'][number]) {
    const i = form.domains.indexOf(value)
    if (i >= 0) form.domains.splice(i, 1)
    else form.domains.push(value)
  }

  async function submit() {
    errors.value = []
    submitting.value = true
    try {
      await $fetch('/api/volunteer', { method: 'POST', body: { ...form } })
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
    toggleDomain,
    submit,
  }
}
