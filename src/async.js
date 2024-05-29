const btn = document.querySelector('#btn')

btn.addEventListener('click', () => {
  import('lodash').then(result => {
    console.log('Async Result', result)
  })
})
