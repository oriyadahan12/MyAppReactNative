describe('Milestones Screen', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    it('should add a new milestone', async () => {
        await element(by.id('new_stage_input')).typeText('זחילה');
        await element(by.id('add_stage_button')).tap();
        await expect(element(by.text('זחילה'))).toBeVisible();
    });

    it('should edit an existing milestone', async () => {
        await element(by.text('עמידה')).tap();
        await element(by.id('stage_comment_input')).typeText('עומד יפה מאוד!');
        await element(by.id('save_stage_button')).tap();
        await expect(element(by.text('עומד יפה מאוד!'))).toBeVisible();
    });
});
