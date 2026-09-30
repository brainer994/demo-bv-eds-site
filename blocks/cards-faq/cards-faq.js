/**
 * Static FAQ grid: one row per question. Accepts either one cell (heading + answer)
 * or two cells (question | answer). Always expanded, no interaction.
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    if (!row.textContent.trim()) return;
    const li = document.createElement('li');
    li.className = 'cards-faq-item';

    const cells = [...row.children].filter((c) => c.textContent.trim());
    const question = document.createElement('div');
    question.className = 'cards-faq-question';
    const answer = document.createElement('div');
    answer.className = 'cards-faq-answer';

    if (cells.length > 1) {
      // question | answer
      const [q, ...rest] = cells;
      while (q.firstChild) question.append(q.firstChild);
      rest.forEach((c) => { while (c.firstChild) answer.append(c.firstChild); });
    } else if (cells.length === 1) {
      const cell = cells[0];
      const heading = cell.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6');
      const first = heading || (cell.children.length > 1 ? cell.firstElementChild : null);
      if (first) {
        question.append(first);
        while (cell.firstChild) answer.append(cell.firstChild);
      } else {
        // plain text only: treat it as the answer
        while (cell.firstChild) answer.append(cell.firstChild);
      }
    }

    if (question.childNodes.length) li.append(question);
    if (answer.textContent.trim()) li.append(answer);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
