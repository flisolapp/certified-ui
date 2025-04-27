import { ScrollService } from './scroll.service';

describe('ScrollService', () => {
  beforeEach(() => {
    spyOn(window, 'scrollTo');
  });

  it('should scroll to top with smooth behavior', () => {
    ScrollService.toTop();

    // @ts-ignore
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });
  });
});
