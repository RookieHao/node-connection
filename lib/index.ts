const INIT_CONTAINER = Symbol('INIT_CONTAINER')
const GET_NODES = Symbol('GET_NODES')
class DomNodeConnection {
  private container:HTMLElement | null = null

  constructor(options:OptionsType){
    this[INIT_CONTAINER](options.container)
  }

  [INIT_CONTAINER](container:HTMLElement | string){
    if(typeof container === 'string'){
      this.container = document.getElementById(container)
    }else{
      this.container = container
    }
  }

  [GET_NODES](){
    
  }

}

interface OptionsType{
  container:HTMLElement | string
}