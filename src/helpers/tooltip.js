const createTooltip = (id, text) => {
  const tooltip = document.createElement('div');
  tooltip.classList.add('tooltip');
  tooltip.id = id;
  tooltip.setAttribute('popover', 'hint');
  tooltip.setAttribute('role', 'tooltip');
  tooltip.textContent = text;
  tooltip.dataset.originalText = text;
  return tooltip;
};

export const showTooltip = (tooltip, source) => {
  if (!tooltip) return;
  if (tooltip.showPopover) {
    tooltip.showPopover({ source });
  }
};

export const hideTooltip = (tooltip) => {
  if (!tooltip) return;
  if (tooltip.dataset.locked === 'true') return;
  if (tooltip.hidePopover) {
    tooltip.hidePopover();
  }
};

export const attachTooltipHandlers = (target, tooltip) => {
  if (!target || !tooltip) return;

  const show = () => showTooltip(tooltip, target);
  const hide = () => hideTooltip(tooltip);

  target.addEventListener('mouseover', show);
  target.addEventListener('mouseout', hide);
  target.addEventListener('focus', show);
  target.addEventListener('blur', hide);
};

export const initTooltip = (target) => {
  if (!target) return null;
  const text = target.dataset.tooltip;
  if (!text) return null;

  const tooltipId = target.dataset.tooltipId || `${target.id || 'tooltip'}-hint`;
  const tooltip = createTooltip(tooltipId, text);

  target.dataset.tooltipId = tooltipId;
  target.setAttribute('aria-describedby', tooltipId);
  target.append(tooltip);
  attachTooltipHandlers(target, tooltip);

  return tooltip;
};
