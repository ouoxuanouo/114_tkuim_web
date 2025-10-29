(() => {
  const form = document.getElementById('signup-form');
  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');
  const phoneEl = document.getElementById('phone');
  const pwdEl = document.getElementById('password');
  const confirmEl = document.getElementById('confirm');
  const interestsWrap = document.getElementById('interests');
  const termsEl = document.getElementById('terms');
  const submitBtn = document.getElementById('submitBtn');
  const resetBtn = document.getElementById('resetBtn');
  const resultBox = document.getElementById('result');
  const strengthBar = document.getElementById('strength-bar');
  const strengthLabel = document.getElementById('strength-label');

  function setError(input, msg){
    input.setCustomValidity(msg||'');
    const id=input.getAttribute('aria-describedby')?.split(' ').find(i=>i.startsWith('err-'));
    if(id){const p=document.getElementById(id);if(p)p.textContent=msg||'';}
    const f=input.closest('.field');if(f){f.classList.toggle('invalid',!!msg);if(msg)f.classList.remove('ok');}
  }
  function setOK(input,ok){const f=input.closest('.field');if(f){ok?(f.classList.add('ok'),f.classList.remove('invalid')):f.classList.remove('ok');}}

  function validateName(){const v=nameEl.value.trim();if(!v){setError(nameEl,'請填寫姓名');return false;}setError(nameEl,'');setOK(nameEl,true);return true;}
  function validateEmail(){if(!emailEl.value.trim()){setError(emailEl,'請填寫 Email');return false;}if(!emailEl.checkValidity()){setError(emailEl,'Email 格式不正確');return false;}setError(emailEl,'');setOK(emailEl,true);return true;}

  // ✅ 修改後的電話驗證（必須09開頭，共10碼）
  function validatePhone(){
    const v = phoneEl.value.trim();
    if(!v){
      setError(phoneEl, '請填寫手機號碼');
      return false;
    }
    if(!/^09\d{8}$/.test(v)){
      setError(phoneEl, '手機號碼需為09開頭的10碼數字');
      return false;
    }
    setError(phoneEl, '');
    setOK(phoneEl, true);
    return true;
  }

  function scorePassword(p){let s=0;if(!p)return 0;if(p.length>=8)s++;if(p.length>=12)s++;if(/[a-z]/.test(p)&&/[A-Z]/.test(p))s++;if(/\d/.test(p))s++;if(/[^A-Za-z0-9]/.test(p))s++;return Math.min(s,5);}
  function updateStrength(p){const s=scorePassword(p),pct=(s/5)*100;strengthBar.style.width=pct+'%';let l='—',c='neutral';if(s<=1){l='弱';c='weak';}else if(s<=3){l='中';c='medium';}else{l='強';c='strong';}strengthBar.className='bar '+c;strengthLabel.textContent='強度：'+l;}
  function validatePassword(){const v=pwdEl.value;if(!v){setError(pwdEl,'請輸入密碼');updateStrength('');return false;}if(v.length<8){setError(pwdEl,'密碼至少 8 碼');updateStrength(v);return false;}if(!/[A-Za-z]/.test(v)||!/\d/.test(v)){setError(pwdEl,'需同時包含英文字母與數字');updateStrength(v);return false;}setError(pwdEl,'');setOK(pwdEl,true);updateStrength(v);return true;}
  function validateConfirm(){if(!confirmEl.value){setError(confirmEl,'請再次輸入密碼');return false;}if(confirmEl.value!==pwdEl.value){setError(confirmEl,'兩次密碼不一致');return false;}setError(confirmEl,'');setOK(confirmEl,true);return true;}

  function validateInterests(){
    const checked=interestsWrap.querySelectorAll('input:checked');
    const errP=document.getElementById('err-interests');
    if(checked.length===0){errP.textContent='請至少勾選 1 個興趣';interestsWrap.classList.add('invalid');return false;}
    errP.textContent='';interestsWrap.classList.remove('invalid');return true;
  }
  function validateTerms(){if(!termsEl.checked){setError(termsEl,'請勾選服務條款');return false;}setError(termsEl,'');return true;}

  interestsWrap.addEventListener('change',e=>{
    if(e.target.matches('input[type="checkbox"]')){
      e.target.closest('.tag')?.classList.toggle('selected',e.target.checked);
      validateInterests();
      saveToLocal();
    }
  });

  [nameEl,emailEl,phoneEl,pwdEl,confirmEl].forEach(el=>{
    el.addEventListener('input',()=>{
      setError(el,'');
      if(el===nameEl)validateName();
      if(el===emailEl)validateEmail();
      if(el===phoneEl)validatePhone();
      if(el===pwdEl){validatePassword();validateConfirm();}
      if(el===confirmEl)validateConfirm();
      saveToLocal();
    });
    el.addEventListener('blur',()=>{
      if(el===nameEl)validateName();
      if(el===emailEl)validateEmail();
      if(el===phoneEl)validatePhone();
      if(el===pwdEl)validatePassword();
      if(el===confirmEl)validateConfirm();
    });
  });

  const KEY='signup_cache';
  function saveToLocal(){
    const d={
      name:nameEl.value,email:emailEl.value,phone:phoneEl.value,
      interests:Array.from(interestsWrap.querySelectorAll('input:checked')).map(c=>c.value),
      terms:termsEl.checked
    };
    localStorage.setItem(KEY,JSON.stringify(d));
  }
  function loadFromLocal(){
    const raw=localStorage.getItem(KEY);if(!raw)return;
    const d=JSON.parse(raw);
    if(d.name){nameEl.value=d.name;setOK(nameEl,true);}
    if(d.email){emailEl.value=d.email;if(emailEl.checkValidity())setOK(emailEl,true);}
    if(d.phone){phoneEl.value=d.phone;if(/^09\d{8}$/.test(d.phone))setOK(phoneEl,true);}
    if(Array.isArray(d.interests)){
      interestsWrap.querySelectorAll('input').forEach(c=>{
        c.checked=d.interests.includes(c.value);
        c.closest('.tag')?.classList.toggle('selected',c.checked);
      });
    }
    if(d.terms)termsEl.checked=true;
  }
  loadFromLocal();

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const ok=validateName()&validateEmail()&validatePhone()&
             validatePassword()&validateConfirm()&
             validateInterests()&validateTerms();
    const first=form.querySelector(':invalid,.field.invalid input,#interests.invalid');
    if(!ok||first){(first?.focus?.())||nameEl.focus();resultBox.textContent='';return;}
    submitBtn.disabled=true;submitBtn.classList.add('loading');
    await new Promise(r=>setTimeout(r,1000));
    submitBtn.disabled=false;submitBtn.classList.remove('loading');
    resultBox.textContent='註冊成功';resultBox.classList.add('success');
    localStorage.removeItem(KEY);
    form.reset();updateStrength('');
    document.querySelectorAll('.error').forEach(p=>p.textContent='');
    document.querySelectorAll('.field').forEach(f=>{f.classList.remove('invalid');f.classList.remove('ok');});
    interestsWrap.classList.remove('invalid');
    interestsWrap.querySelectorAll('.tag').forEach(t=>t.classList.remove('selected'));
  });

  resetBtn.addEventListener('click',()=>{
    form.reset();updateStrength('');localStorage.removeItem(KEY);
    document.querySelectorAll('.error').forEach(p=>p.textContent='');
    document.querySelectorAll('.field').forEach(f=>{f.classList.remove('invalid');f.classList.remove('ok');});
    interestsWrap.classList.remove('invalid');
    interestsWrap.querySelectorAll('.tag').forEach(t=>t.classList.remove('selected'));
    resultBox.textContent='';resultBox.classList.remove('success');nameEl.focus();
  });
})();
