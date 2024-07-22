<script>
export default {
  name: "AbimoAccordion",
  props: {
    steps: {
      type: Array,
      required: true,
    },
  },
};
</script>

<template>
  <div
    class="accordion"
    id="accordionExample"
  >
    <div
      v-for="step in steps"
      :key="step.id"
      class="accordion-item accordion-flush"
    >
      <h5
        class="accordion-header"
        :id="`heading${step.id}`"
      >
        <button
          class="accordion-button"
          type="button"
          data-bs-toggle="collapse"
          :data-bs-target="`#collapse${step.id}`"
          :aria-controls="`collapse${step.id}`"
        >
          {{ step.id }}. {{ step.label }}
        </button>
      </h5>

      <div
        :id="`collapse${step.id}`"
        :class="['accordion-collapse collapse', { show: step.isActive }]"
        :aria-labelledby="`heading${step.id}`"
        data-bs-parent="#accordionExample"
      >
        <div class="accordion-body">
          <p>{{ step.description }}</p>
          <slot :step="step" />
        </div>
      </div>
    </div>
  </div>
</template>

