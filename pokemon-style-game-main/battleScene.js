const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battleBackground.png'
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  image: battleBackgroundImage
})

let ennemy
let emby
let renderedSprites
let battleAnimationId
let queue

function initBattle() {
  document.querySelector('#userInterface').style.display = 'block'
  document.querySelector('#dialogueBox').style.display = 'none'
  document.querySelector('#enemyHealthBar').style.width = '100%'
  document.querySelector('#playerHealthBar').style.width = '100%'
  document.querySelector('#attacksBox').replaceChildren()

  // select a random object enemy from monsters.js
  ennemy2 = monsters[Object.keys(monsters)[Math.floor(Math.random() * Object.keys(monsters).length)]]
  
  //create a random Monster 
  ennemy = new Monster({
    position: {
      x: 800,
      y: 100
    },
    image: {
      src: ennemy2.image.src
    },
    frames: {
      max: 4,
      hold: 30
    },

    animate: true,
    isEnemy: true,
    name: ennemy2.name,
    attacks: ennemy2.attacks
  })

  //set name of ennemy on the screen
  document.querySelector('#enemyName').innerHTML = ennemy.name
  
  // set pv on health bar
  document.querySelector('#enemyHealthBar').innerHTML = ennemy.health



  emby = new Monster(monsters.Emby)
  emby.position.x = 280
  emby.position.y = 325
  emby.isEnemy = false
  renderedSprites = [ennemy, emby]
  queue = []

  emby.attacks.forEach((attack) => {
    const button = document.createElement('button')
    button.innerHTML = attack.name
    document.querySelector('#attacksBox').append(button)
  })

  // our event listeners for our buttons (attack)
  document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
      emby.attack({
        attack: selectedAttack,
        recipient: ennemy,
        renderedSprites
      })

      if (ennemy.health <= 0) {
        queue.push(() => {
          ennemy.faint()
        })
        queue.push(() => {
          // fade back to black
          gsap.to('#overlappingDiv', {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationId)
              animate()
              document.querySelector('#userInterface').style.display = 'none'

              gsap.to('#overlappingDiv', {
                opacity: 0
              })

              battle.initiated = false
              audio.Map.play()
            }
          })
        })
      }

      // ennemy or enemy attacks right here
      const randomAttack =
        ennemy.attacks[Math.floor(Math.random() * ennemy.attacks.length)]

      queue.push(() => {
        ennemy.attack({
          attack: randomAttack,
          recipient: emby,
          renderedSprites
        })

        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint()
          })

          queue.push(() => {
            // fade back to black
            gsap.to('#overlappingDiv', {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationId)
                animate()
                document.querySelector('#userInterface').style.display = 'none'

                gsap.to('#overlappingDiv', {
                  opacity: 0
                })

                battle.initiated = false
                audio.Map.play()
              }
            })
          })
        }
      })
    })

    button.addEventListener('mouseenter', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
      document.querySelector('#attackType').innerHTML = selectedAttack.type
      document.querySelector('#attackType').style.color = selectedAttack.color
    })
  })
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle)
  battleBackground.draw()
  // update the pv of ennemy
  document.querySelector('#enemyHealthBar').innerHTML = ennemy.health

  ///console.log(battleAnimationId)

  renderedSprites.forEach((sprite) => {
    sprite.draw()
  })
}

animate()
// initBattle()
// animateBattle()

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
  if (queue.length > 0) {
    queue[0]()
    queue.shift()
  } else e.currentTarget.style.display = 'none'
})
