/* DEXORA Homepage — small interactive advisory preview. No external libraries. */
(() => {
  const samples = {
    save: {
      title: 'Vì sao chọn phương án tiết kiệm?',
      body: 'Tập trung vào các tác vụ cần thiết và hạn chế chi phí ngoại hình. Với game 2K hoặc công việc nặng, cần kiểm tra điểm hiệu năng bị đánh đổi trước khi chọn.',
      index: '01 / 03'
    },
    balanced: {
      title: 'Vì sao chọn phương án cân bằng?',
      body: 'Phân bổ ngân sách giữa GPU dành cho game 2K, CPU đủ đáp ứng đa nhiệm và RAM phù hợp để vừa chơi vừa làm việc. Cần kiểm tra benchmark cụ thể trước khi kết luận FPS.',
      index: '02 / 03'
    },
    high: {
      title: 'Vì sao chọn phương án cao cấp?',
      body: 'Ưu tiên dư địa hiệu năng và khả năng nâng cấp khi tác vụ yêu cầu cao hơn. Chi phí bổ sung chỉ đáng cân nhắc nếu cải thiện đúng công việc bạn sử dụng.',
      index: '03 / 03'
    }
  };
  const title = document.getElementById('dxPreviewTitle');
  const body = document.getElementById('dxPreviewText');
  const counter = document.querySelector('.dx-preview-bottom span:last-child');
  document.querySelectorAll('[data-dx-preview]').forEach(button => {
    button.addEventListener('click', () => {
      const entry = samples[button.dataset.dxPreview];
      if (!entry || !title || !body) return;
      document.querySelectorAll('[data-dx-preview]').forEach(other => {
        const selected = other === button;
        other.classList.toggle('is-active', selected);
        other.setAttribute('aria-pressed', String(selected));
      });
      title.textContent = entry.title;
      body.textContent = entry.body;
      if (counter) counter.textContent = entry.index;
    });
  });
})();
