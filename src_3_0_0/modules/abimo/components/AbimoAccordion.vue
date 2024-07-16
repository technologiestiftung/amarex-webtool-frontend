<script>
export default {
  name: "AbimoAccordion",
  props: {
    steps: {
      type: Array,
      required: true,
    },
  },
  mounted() {
    this.localSteps = this.steps.map((step) => ({
      ...step,
      isActive: step.defaultActive,
    }));
  },
  methods: {
    toggle(stepId) {
      this.localSteps = this.localSteps.map((step) => ({
        ...step,
        isActive: step.id === stepId ? !step.isActive : step.isActive,
      }));
    },
  },
};
</script>
<template>
  <div>
    <div
      v-for="step in steps"
      :key="step.id"
      class="accordion-item"
    >
      <h5
        class="accordion-header"
        @click="toggle(step.id)"
      >
        {{ step.id }}. {{ step.label }}
      </h5>

      <div
        v-show="step.isActive"
        class="accordion-content"
      >
        <p>{{ step.description }}</p>
        <slot :step="step" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion-item {
  margin-bottom: 1em;
}

.accordion-header {
  cursor: pointer;
  background: #54bba8;
  color: white;
  padding: 0.5em;
}

.accordion-content {
  border: 1px solid #54bba8;
  padding: 0.75em;
}
</style>

